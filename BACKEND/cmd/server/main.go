package main

import (
	"log"

	"github.com/akhilbabu26/multibrand_database_4/internal/bootstrap"
	
	// user
	userHandler "github.com/akhilbabu26/multibrand_database_4/internal/delivery/http/user"
	userRepository "github.com/akhilbabu26/multibrand_database_4/internal/repository/user"
	userUsecase "github.com/akhilbabu26/multibrand_database_4/internal/usecase/user"
	
	//product
	productHandler "github.com/akhilbabu26/multibrand_database_4/internal/delivery/http/product"
	productRepository "github.com/akhilbabu26/multibrand_database_4/internal/repository/product"
	productUsecase "github.com/akhilbabu26/multibrand_database_4/internal/usecase/product"

	//cart
	cartHandler "github.com/akhilbabu26/multibrand_database_4/internal/delivery/http/cart"
	cartRepository "github.com/akhilbabu26/multibrand_database_4/internal/repository/cart"
	cartUsecase "github.com/akhilbabu26/multibrand_database_4/internal/usecase/cart"


	//product
	wishlistHandler "github.com/akhilbabu26/multibrand_database_4/internal/delivery/http/wishlist"
	wishlistRepository "github.com/akhilbabu26/multibrand_database_4/internal/repository/wishlist"
	wishlistUsecase "github.com/akhilbabu26/multibrand_database_4/internal/usecase/wishlist"
	
	//address
	addressHandler "github.com/akhilbabu26/multibrand_database_4/internal/delivery/http/address"
	addressRepository "github.com/akhilbabu26/multibrand_database_4/internal/repository/address"
	addressUsecase "github.com/akhilbabu26/multibrand_database_4/internal/usecase/address"
	
	
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


	// 5. setup gin
	r := gin.Default()
	api := r.Group("/api/v1")

	// 6. register routes
	uHandler.RegisterRoutes(api, app) // user routes
	pHandler.RegisterRoutes(api, app) // product routes
	cHandler.RegisterRoutes(api, app) // cart routes
	wHandler.RegisterRoutes(api, app) // wishlist routes
	aHandler.RegisterRoutes(api, app) // address routes

	log.Printf("Server running on %s", app.Config.App.Port)
	r.Run(app.Config.App.Port)
}

// useful docker commands:
// docker run -d --name multibrand-redis -p 6379:6379 redis:alpine  → create container
// docker start multibrand-redis → start existing
// docker stop multibrand-redis  → stop
// docker ps → check running