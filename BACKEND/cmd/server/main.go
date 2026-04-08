package main

import (
	"context" //used to control execution flow across goroutines, especially for: cancellation, timeouts, request-scoped data
	"log"
	"net/http"
	"os"        // access to operating system like environment variables and process control
	"os/signal" //listen to OS-level signals (like Ctrl+C or system shutdown)
	"syscall"   // provides low-level OS signals and system calls like syscall.SIGINT etc
	"time"

	"github.com/akhilbabu26/multibrand_database_4/internal/bootstrap"
	"github.com/akhilbabu26/multibrand_database_4/internal/infrastructure/logger"
	"go.uber.org/zap"
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

	// Create a Master Context that controls all background workers
	jobCtx, jobCancel := context.WithCancel(context.Background())

	// Construct Gin Engine with fully wired module infrastructure
	r := setupServer(app, appLogger, jobCtx)

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

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel() //Give the server 5 seconds to shut down properly

	if err := srv.Shutdown(ctx); err != nil { // Stops accepting new requests and Allows ongoing requests to finish and Waits up to 5 seconds
		appLogger.Fatal("Server forced to shutdown", zap.Error(err))
	}

	appLogger.Info("Server exited gracefully")
}
