package main

import (
	"context" //used to control execution flow across goroutines, especially for: cancellation, timeouts, request-scoped data
	"log"
	"net/http"
	"os" // access to operating system like environment variables and process control
	"os/signal" //listen to OS-level signals (like Ctrl+C or system shutdown)
	"syscall"  // provides low-level OS signals and system calls like syscall.SIGINT etc
	"time"

	"github.com/gin-contrib/cors" // it controls which websites are allowed to call your API

	"github.com/akhilbabu26/multibrand_database_4/internal/bootstrap"
	"github.com/akhilbabu26/multibrand_database_4/internal/infrastructure/database"
	"github.com/akhilbabu26/multibrand_database_4/internal/infrastructure/logger" 
	"github.com/akhilbabu26/multibrand_database_4/internal/middleware"
	"github.com/akhilbabu26/multibrand_database_4/pkg/cloudinary"
	"go.uber.org/zap"
	
	allRepo "github.com/akhilbabu26/multibrand_database_4/internal/repository/postgres"
	
	// auth
	authUsecase "github.com/akhilbabu26/multibrand_database_4/internal/services/auth"
	authHandler "github.com/akhilbabu26/multibrand_database_4/internal/controllers/auth"

	// user
	userUsecase "github.com/akhilbabu26/multibrand_database_4/internal/services/user"
	userHandler "github.com/akhilbabu26/multibrand_database_4/internal/controllers/user"
	
	//product
	
	productUsecase "github.com/akhilbabu26/multibrand_database_4/internal/services/product"
	productHandler "github.com/akhilbabu26/multibrand_database_4/internal/controllers/product"

	//cart
	cartUsecase "github.com/akhilbabu26/multibrand_database_4/internal/services/cart"
	cartHandler "github.com/akhilbabu26/multibrand_database_4/internal/controllers/cart"


	//wishlist
	wishlistUsecase "github.com/akhilbabu26/multibrand_database_4/internal/services/wishlist"
	wishlistHandler "github.com/akhilbabu26/multibrand_database_4/internal/controllers/wishlist"
	
	//address
	addressUsecase "github.com/akhilbabu26/multibrand_database_4/internal/services/address"
	addressHandler "github.com/akhilbabu26/multibrand_database_4/internal/controllers/address"
	
	//order
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
	defer appLogger.Sync() // all pending logs print when main func ends

	// 1. initialize everything
	app, err := bootstrap.Initialize(appLogger)
	if err != nil {
		appLogger.Fatal("failed to initialize app", zap.Error(err))
	}

	//  on shutdown
	defer func() {
		sqlDB, _ := app.DB.DB() //close db
		sqlDB.Close()

		if app.Redis != nil { // Close Redis 
			app.Redis.Close()
		}
	}()

	txManager := database.NewTransactionManager(app.DB)

	// wire user module
	uRepo    := allRepo.NewUserRepository(app.DB)
	uUsecase := userUsecase.NewUserUsecase(uRepo)
	uHandler := userHandler.NewUserHandler(uUsecase)

	// wire auth module
	auUsecase := authUsecase.NewAuthUsecase(uRepo, app.Mailer, app.Config, app.TokenStore)
	auHandler := authHandler.NewAuthHandler(auUsecase)

	// wire product module
	imgService, err := cloudinary.NewCloudinaryService(app.Config)
	if err != nil {
		appLogger.Fatal("failed to initialize cloudinary service", zap.Error(err))
	}
	pRepo    := allRepo.NewProductRepository(app.DB)
	pUsecase := productUsecase.NewProductUsecase(pRepo, imgService)
	pHandler := productHandler.NewProductHandler(pUsecase)

	// wire cart
	cRepo    := allRepo.NewCartRepository(app.DB)
	cUsecase := cartUsecase.NewCartUsecase(cRepo, pRepo)
	cHandler := cartHandler.NewCartHandler(cUsecase)

	// wire wishlist — depends on cartUsecase
	wRepo    := allRepo.NewWishlistRepository(app.DB)
	wUsecase := wishlistUsecase.NewWishlistUsecase(wRepo, pRepo, cUsecase)
	wHandler := wishlistHandler.NewWishlistHandler(wUsecase)

	// wire address
	aRepo := allRepo.NewAddressRepository(app.DB)
	aUsecase := addressUsecase.NewAddressUsecase(aRepo)
	aHandler := addressHandler.NewAddressHandler(aUsecase)

	// wire order
	oRepo := allRepo.NewOrderRepository(app.DB)
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
	// r := gin.New()
	// r.Use(gin.Recovery())
	r := gin.Default()
	
	// Structured logging for every single HTTP request
	r.Use(middleware.RequestLogger(appLogger))
	
	// Support Strict CORS (Cross-Origin Resource Sharing)
	config := cors.DefaultConfig() // Creates base CORS settings
	config.AllowOrigins = app.Config.App.CORSOrigins // Allow specific origins
	config.AllowCredentials = true // allow the cookies and jwt headres
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization", "X-Requested-With", "Accept"} // Allows frontend to send that slice
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

	// 7. HTTP Server
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

	// creates a channel of type os.Signal (used to receive OS signals like Ctrl+C)
	quit := make(chan os.Signal, 1) 
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM) // SIGINT → Ctrl + C, SIGTERM → Docker / system stop
	
	<-quit // Blocks until signal arrives

	appLogger.Info("Shutting down server softly...")

	// Safely power down all infinite loop background goroutines instantly!
	jobCancel() // This triggers ctx.Done()

	// Close Redis connection gracefully
	if err := app.Redis.Close(); err != nil {
		appLogger.Error("error closing Redis connection", zap.Error(err))
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel() //Give the server 5 seconds to shut down properly
	
	if err := srv.Shutdown(ctx); err != nil { // Stops accepting new requests and Allows ongoing requests to finish and Waits up to 5 seconds
		appLogger.Fatal("Server forced to shutdown", zap.Error(err))
	}

	appLogger.Info("Server exited gracefully")
}