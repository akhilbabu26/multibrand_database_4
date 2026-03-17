package database

import (
	"fmt"

	"github.com/akhilbabu26/multibrand_database_4/internal/infrastructure/config"
	userdomain "github.com/akhilbabu26/multibrand_database_4/internal/domain/user"
	productdomain "github.com/akhilbabu26/multibrand_database_4/internal/domain/product"
	cartdomain "github.com/akhilbabu26/multibrand_database_4/internal/domain/cart"
	wishlistdomain "github.com/akhilbabu26/multibrand_database_4/internal/domain/wishlist"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

)

func NewPostgresDB(cfg *config.DatabaseConfig) (*gorm.DB, error){
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.Host,
		cfg.Port,
		cfg.User,
		cfg.Password,
		cfg.Name,
		cfg.SSLMode,
	)

	// Show SQL logs only in development
	gormLogger := logger.Default.LogMode(logger.Info)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: gormLogger,
	})

	if err != nil{
		return nil, fmt.Errorf("faild to connect to database %w", err)
	}

	// Connection pool settings
	sqlDB, err := db.DB() // psqlDB is pointer to DB (*sql.DB)
	if err != nil{
		return nil, fmt.Errorf("failed to get psql.DB: %w", err)
	}

	sqlDB.SetMaxOpenConns(25) // how many connections can be open. in this case its 25
	sqlDB.SetMaxIdleConns(10) // how many connections can be kept alive and it can be ready to use also if beyound the limit 10 it will close

	return db, nil
}

func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&userdomain.User{},
		&userdomain.PendingUser{},
		&productdomain.Product{},
		&wishlistdomain.Wishlist{},   
		&cartdomain.Cart{},       
		&cartdomain.CartItem{},   
	)
}