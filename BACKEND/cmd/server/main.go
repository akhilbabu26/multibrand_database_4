package main

import (
	"log"

	"github.com/akhilbabu26/multibrand_database_4/internal/bootstrap"
	handler "github.com/akhilbabu26/multibrand_database_4/internal/delivery/http/user"
	repository "github.com/akhilbabu26/multibrand_database_4/internal/repository/user"
	usecase "github.com/akhilbabu26/multibrand_database_4/internal/usecase/user"
	"github.com/gin-gonic/gin"
)

func main(){
	// 1. Initialize everything
	app, err := bootstrap.Initialize() 
	if err != nil{
		log.Fatalf("failed to initialize app: %v", err)
	}

	// close the db on shutdown
	defer func(){
		sqlDB, _ := app.DB.DB()
		sqlDB.Close()
	}()

	//2. wire user modules
	userRepo := repository.NewUserRepository(app.DB) 
	userUsecase := usecase.NewUserUsecase(userRepo, app.Mailer, app.Config, app.TokenStore)
	userHandler := handler.NewUserHandler(userUsecase)

	// 3. Setup Gin
	r := gin.Default()
	api := r.Group("/api/v1")

	// 4. register routes
	userHandler.RegisterRoutes(api, app)

	log.Printf("Server running on %s", app.Config.App.Port)
	r.Run(app.Config.App.Port)
}

// docker run -d --name multibrand-redis -p 6379:6379 redis:alpine
// docker start multibrand-redis -to start the existing container
// docker ps - check the existing container