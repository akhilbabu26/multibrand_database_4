package main

import (
	"context"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"github.com/akhilbabu26/multibrand_database_4/internal/bootstrap"
	"github.com/akhilbabu26/multibrand_database_4/internal/infrastructure/database"
	"github.com/akhilbabu26/multibrand_database_4/internal/middleware"
	"github.com/akhilbabu26/multibrand_database_4/internal/repository/generic"
	"github.com/akhilbabu26/multibrand_database_4/pkg/cloudinary"

	"github.com/akhilbabu26/multibrand_database_4/internal/api/routes"
	handlers "github.com/akhilbabu26/multibrand_database_4/internal/controllers/handlers"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/entities"
	"github.com/akhilbabu26/multibrand_database_4/internal/repository/postgres"
	usecases "github.com/akhilbabu26/multibrand_database_4/internal/services"
)

// setupServer assembles all generic repositories, modules, middlewares, and routes
// into a single operational *gin.Engine instance securely extracted from main.go
func setupServer(app *bootstrap.App, appLogger *zap.Logger, jobCtx context.Context) *gin.Engine {
	txManager := database.NewTransactionManager(app.DB)

	// wire user module
	uRepo := postgres.NewUserRepository(app.DB)
	uUsecase := usecases.NewUserUsecase(uRepo)
	uHandler := handlers.NewUserHandler(uUsecase)

	// wire auth module
	auUsecase := usecases.NewAuthUsecase(uRepo, app.Mailer, app.Config, app.TokenStore)
	auHandler := handlers.NewAuthHandler(auUsecase)

	// wire product module
	imgService, err := cloudinary.NewCloudinaryService(app.Config)
	if err != nil {
		appLogger.Fatal("failed to initialize cloudinary service", zap.Error(err))
	}
	productBaseRepo := generic.NewGenericRepository[entities.Product](app.DB)
	// repositories
	pRepo := postgres.NewProductRepository(productBaseRepo)
	cRepo := postgres.NewCartRepository(app.DB)
	wRepo := postgres.NewWishlistRepository(app.DB)

	pUsecase := usecases.NewProductUsecase(pRepo, cRepo, wRepo, imgService)
	pHandler := handlers.NewProductHandler(pUsecase)
	cUsecase := usecases.NewCartUsecase(cRepo, pRepo)
	cHandler := handlers.NewCartHandler(cUsecase)

	// wire wishlist — depends on cartUsecase
	wUsecase := usecases.NewWishlistUsecase(wRepo, pRepo, cUsecase)
	wHandler := handlers.NewWishlistHandler(wUsecase)

	// wire address
	aRepo := postgres.NewAddressRepository(app.DB)
	aUsecase := usecases.NewAddressUsecase(aRepo)
	aHandler := handlers.NewAddressHandler(aUsecase)

	// wire order
	oRepo := postgres.NewOrderRepository(app.DB)
	oUsecase := usecases.NewOrderUsecase(oRepo, cRepo, pRepo, aRepo, txManager)
	oHandler := handlers.NewOrderHandler(oUsecase)

	// wire payment
	payUsecase := usecases.NewPaymentUsecase(oRepo, app.Razorpay)
	payHandler := handlers.NewPaymentHandler(payUsecase)

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

	// setup gin
	r := gin.Default()

	// Structured logging for every single HTTP request
	r.Use(middleware.RequestLogger(appLogger))

	// Support Strict CORS (Cross-Origin Resource Sharing)
	config := cors.DefaultConfig()                                                                                            // Creates base CORS settings
	config.AllowOrigins = app.Config.App.CORSOrigins                                                                          // Allow specific origins
	config.AllowCredentials = true                                                                                            // allow the cookies and jwt headres
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization", "X-Requested-With", "Accept"} // Allows frontend to send that slice
	r.Use(cors.New(config))

	api := r.Group("/api/v1")

	// Apply robust Global API rate limit (100 res/min) to prevent brute level 7 DDOS
	globalLimit := middleware.RateLimiter(app.Redis, "100-M")
	api.Use(globalLimit)

	// register routes
	routes.RegisterAuthRoutes(api, app, auHandler)     // auth routes
	routes.RegisterUserRoutes(api, app, uHandler)      // user routes
	routes.RegisterProductRoutes(api, app, pHandler)   // product routes
	routes.RegisterCartRoutes(api, app, cHandler)      // cart routes
	routes.RegisterWishlistRoutes(api, app, wHandler)  // wishlist routes
	routes.RegisterAddressRoutes(api, app, aHandler)   // address routes
	routes.RegisterOrderRoutes(api, app, oHandler)     // order routes
	routes.RegisterPaymentRoutes(api, app, payHandler) // payment routes

	return r
}
