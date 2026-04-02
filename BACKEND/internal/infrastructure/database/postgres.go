package database

import (
	"fmt"
	"time"

	"github.com/akhilbabu26/multibrand_database_4/internal/infrastructure/config"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/entities"

	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"moul.io/zapgorm2"
)

func NewPostgresDB(cfg *config.DatabaseConfig, appLogger *zap.Logger) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.Host,
		cfg.Port,
		cfg.User,
		cfg.Password,
		cfg.Name,
		cfg.SSLMode,
	)

	// Intercept all plain-text SQL logs and output strict Zap JSON telemetry
	gormLogger := zapgorm2.New(appLogger)
	gormLogger.SetAsDefault()

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: gormLogger,
	})

	if err != nil {
		return nil, fmt.Errorf("faild to connect to database %w", err)
	}

	// Connection pool settings
	sqlDB, err := db.DB() // psqlDB is pointer to DB (*sql.DB)
	if err != nil {
		return nil, fmt.Errorf("failed to get psql.DB: %w", err)
	}

	sqlDB.SetMaxOpenConns(25)           // how many connections can be open. in this case its 25
	sqlDB.SetMaxIdleConns(10)           // how many connections can be kept alive and it can be ready to use also if beyound the limit 10 it will close
	sqlDB.SetConnMaxLifetime(time.Hour) // recycle connections every 60 minutes to clear stale AWS networks

	return db, nil
}

func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&entities.User{},
		&entities.PendingUser{},
		&entities.Product{},
		&entities.ProductImage{},
		&entities.Wishlist{},
		&entities.Cart{},
		&entities.CartItem{},
		&entities.Address{},
		&entities.Order{},
		&entities.OrderItem{},
	)
}
