package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"

	"github.com/akhilbabu26/multibrand_database_4/internal/bootstrap"
	"github.com/akhilbabu26/multibrand_database_4/internal/infrastructure/database"
	"github.com/akhilbabu26/multibrand_database_4/internal/infrastructure/logger" 
	"github.com/akhilbabu26/multibrand_database_4/internal/middleware"
	"go.uber.org/zap"
	
	// auth
	authUsecase "github.com/akhilbabu26/multibrand_database_4/internal/services/auth"
	authHandler "github.com/akhilbabu26/multibrand_database_4/internal/controllers/auth"

	// user
	userRepository "github.com/akhilbabu26/multibrand_database_4/internal/repository/user"
	userUsecase "github.com/akhilbabu26/multibrand_database_4/internal/services/user"
	userHandler "github.com/akhilbabu26/multibrand_database_4/internal/controllers/user"
	
	//product
	productRepository "github.com/akhilbabu26/multibrand_database_4/internal/repository/product"
	productUsecase "github.com/akhilbabu26/multibrand_database_4/internal/services/product"
	productHandler "github.com/akhilbabu26/multibrand_database_4/internal/controllers/product"

	//cart
	cartRepository "github.com/akhilbabu26/multibrand_database_4/internal/repository/cart"
	cartUsecase "github.com/akhilbabu26/multibrand_database_4/internal/services/cart"
	cartHandler "github.com/akhilbabu26/multibrand_database_4/internal/controllers/cart"


	//wishlist
	wishlistRepository "github.com/akhilbabu26/multibrand_database_4/internal/repository/wishlist"
	wishlistUsecase "github.com/akhilbabu26/multibrand_database_4/internal/services/wishlist"
	wishlistHandler "github.com/akhilbabu26/multibrand_database_4/internal/controllers/wishlist"
	
	//address
	addressRepository "github.com/akhilbabu26/multibrand_database_4/internal/repository/address"
	addressUsecase "github.com/akhilbabu26/multibrand_database_4/internal/services/address"
	addressHandler "github.com/akhilbabu26/multibrand_database_4/internal/controllers/address"
	
	//order
	orderRepository "github.com/akhilbabu26/multibrand_database_4/internal/repository/order"
	orderUsecase "github.com/akhilbabu26/multibrand_database_4/internal/services/order"
	orderHandler "github.com/akhilbabu26/multibrand_database_4/internal/controllers/order"

	//payment
	paymentUsecase "github.com/akhilbabu26/multibrand_database_4/internal/services/payment"
	paymentHandler "github.com/akhilbabu26/multibrand_database_4/internal/controllers/payment"
	
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize Zap Logger
	appLogger, err := logger.NewLogger()
	if err != nil {
		log.Fatalf("failed to initialize logger: %v", err)
	}
	defer appLogger.Sync()

	// 1. initialize everything
	app, err := bootstrap.Initialize(appLogger)
	if err != nil {
		appLogger.Fatal("failed to initialize app", zap.Error(err))
	}

	// close db on shutdown
	defer func() {
		sqlDB, _ := app.DB.DB()
		sqlDB.Close()

		// Close Redis properly to prevent AWS socket resource leaks
		if app.Redis != nil {
			app.Redis.Close()
		}
	}()

	txManager := database.NewTransactionManager(app.DB)

	// wire user module
	uRepo    := userRepository.NewUserRepository(app.DB)
	uUsecase := userUsecase.NewUserUsecase(uRepo)
	uHandler := userHandler.NewUserHandler(uUsecase)

	// wire auth module
	auUsecase := authUsecase.NewAuthUsecase(uRepo, app.Mailer, app.Config, app.TokenStore)
	auHandler := authHandler.NewAuthHandler(auUsecase)

	// wire product module
	pRepo    := productRepository.NewProductRepository(app.DB)
	pUsecase := productUsecase.NewProductUsecase(pRepo)
	pHandler := productHandler.NewProductHandler(pUsecase)

	// wire cart
	cRepo    := cartRepository.NewCartRepository(app.DB)
	cUsecase := cartUsecase.NewCartUsecase(cRepo, pRepo)
	cHandler := cartHandler.NewCartHandler(cUsecase)

	// wire wishlist — depends on cartUsecase
	wRepo    := wishlistRepository.NewWishlistRepository(app.DB)
	wUsecase := wishlistUsecase.NewWishlistUsecase(wRepo, pRepo, cUsecase)
	wHandler := wishlistHandler.NewWishlistHandler(wUsecase)

	// wire address
	aRepo := addressRepository.NewAddressRepository(app.DB)
	aUsecase := addressUsecase.NewAddressUsecase(aRepo)
	aHandler := addressHandler.NewAddressHandler(aUsecase)

	// wire order
	oRepo := orderRepository.NewOrderRepository(app.DB)
	oUsecase := orderUsecase.NewOrderUsecase(oRepo, cRepo, pRepo, aRepo, txManager)
	oHandler := orderHandler.NewOrderHandler(oUsecase)

	// wire payment
	payUsecase := paymentUsecase.NewPaymentUsecase(oRepo, app.Razorpay)
	payHandler := paymentHandler.NewPaymentHandler(payUsecase)

	// Create a Master Context that controls all background workers
	jobCtx, jobCancel := context.WithCancel(context.Background())

	// Background job for OTP cleanup
	go func(ctx context.Context) {
		ticker := time.NewTicker(1 * time.Hour)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				// When context is cancelled, exit the goroutine cleanly
				appLogger.Info("OTP background job shut down gracefully")
				return
			case <-ticker.C:
				if err := uRepo.DeleteExpiredPending(); err != nil {
					appLogger.Error("Failed to cleanup expired OTPs", zap.Error(err))
				}
			}
		}
	}(jobCtx)

	// 5. setup gin
	r := gin.Default()
	
	// Structured logging for every single HTTP request
	r.Use(middleware.RequestLogger(appLogger))
	
	// Support Strict CORS (Cross-Origin Resource Sharing)
	config := cors.DefaultConfig()
	config.AllowOrigins = app.Config.App.CORSOrigins
	config.AllowCredentials = true
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization", "X-Requested-With", "Accept"}
	r.Use(cors.New(config))

	api := r.Group("/api/v1")

	// Apply robust Global API rate limit (100 res/min) to prevent brute level 7 DDOS
	globalLimit := middleware.RateLimiter(app.Redis, "100-M")
	api.Use(globalLimit)

	// 6. register routes
	auHandler.RegisterRoutes(api, app) // auth routes
	uHandler.RegisterRoutes(api, app) // user routes
	pHandler.RegisterRoutes(api, app) // product routes
	cHandler.RegisterRoutes(api, app) // cart routes
	wHandler.RegisterRoutes(api, app) // wishlist routes
	aHandler.RegisterRoutes(api, app) // address routes
	oHandler.RegisterRoutes(api, app) // order routes
	payHandler.RegisterRoutes(api, app) // payment routes

	// 7. Graceful Shutdown HTTP Server
	srv := &http.Server{
		Addr:    app.Config.App.Port,
		Handler: r,
	}

	go func() {
		appLogger.Info("Server running", zap.String("addr", srv.Addr))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			appLogger.Fatal("listen failed", zap.Error(err))
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server with
	// a timeout of 5 seconds.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	appLogger.Info("Shutting down server softly...")

	// Safely power down all infinite loop background goroutines instantly!
	jobCancel()

	// Close Redis connection gracefully
	if err := app.Redis.Close(); err != nil {
		appLogger.Error("error closing Redis connection", zap.Error(err))
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		appLogger.Fatal("Server forced to shutdown", zap.Error(err))
	}

	appLogger.Info("Server exited gracefully")
}
