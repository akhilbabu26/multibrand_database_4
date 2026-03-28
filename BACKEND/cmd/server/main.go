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


	//product
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
	// 1. initialize everything
	app, err := bootstrap.Initialize()
	if err != nil {
		log.Fatalf("failed to initialize app: %v", err)
	}

	// close db on shutdown
	defer func() {
		sqlDB, _ := app.DB.DB()
		sqlDB.Close()
	}()

	txManager := database.NewTransactionManager(app.DB)

	// wire user module
	uRepo    := userRepository.NewUserRepository(app.DB)
	uUsecase := userUsecase.NewUserUsecase(uRepo, app.Mailer, app.Config, app.TokenStore)
	uHandler := userHandler.NewUserHandler(uUsecase)

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

	// Background job for OTP cleanup
	go func() {
		ticker := time.NewTicker(1 * time.Hour)
		defer ticker.Stop()
		for {
			<-ticker.C
			if err := uRepo.DeleteExpiredPending(); err != nil {
				log.Printf("Failed to cleanup expired OTPs: %v", err)
			}
		}
	}()

	// 5. setup gin
	r := gin.Default()

	// Support CORS (Cross-Origin Resource Sharing)
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	r.Use(cors.New(config))


	api := r.Group("/api/v1")

	// 6. register routes
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
		log.Printf("Server running on %s", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server with a timeout of 5 seconds.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exiting")
}