package config

import(
	"os"
	"log"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct{
	App AppConfig
	Database DatabaseConfig
	JWT JWTConfig
	SMTP SMTPConfig
	Redis RedisConfig 
	Razorpay RazorpayConfig 
}

type AppConfig struct{
	Port string
	Env string
}

type DatabaseConfig struct{
	Host string
	Port string
	User string
	Password string
	Name string
	SSLMode string
}

type JWTConfig struct{
	Secret string
}

type SMTPConfig struct{
	Host string
	Port int
	Email string
	Password string
	FromName string
}

type RedisConfig struct {
	Addr     string // e.g. "localhost:6379"
	Password string // empty string if no password
	DB       int    // default is 0
}

type RazorpayConfig struct {
	KeyID     string
	KeySecret string
}

// Load reads .env and returns Config
func Load() (*Config, error){
	// if err := godotenv.Load(); err != nil{
	// 	return nil, fmt.Errorf("error loading env file: %w", err)
	// }

	if err := godotenv.Load(); err != nil{
		log.Println("No .env file found, falling back to OS system environment variables")
	}

	appEnv := getEnv("APP_ENV", "development")
	jwtSecret := getEnv("JWT_SECRET", "")

	if appEnv == "production" && jwtSecret == "" {
		log.Fatal("CRITICAL: JWT_SECRET environment variable is required in production environments to prevent security vulnerabilities.")
	}

	if jwtSecret == "" {
		jwtSecret = "multibrand4" // Fallback only meant for local dev
	}

	return &Config{
		App: AppConfig{
			Port: getEnv("APP_PORT", ":8080"),
			Env: getEnv("APP_ENV", "development"),
		},
		Database: DatabaseConfig{
			Host: getEnv("DB_HOST", "localhost"),
			Port: getEnv("DB_PORT", "5432"),
			User: getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", ""),
			Name: getEnv("DB_NAME", "multibrand_database_4"),
			SSLMode: getEnv("DB_SSLMODE", "disable"),
		},
		JWT: JWTConfig{
			Secret: getEnv("JWT_SECRET", "multibrand4"),
		},
		SMTP: SMTPConfig{
			Host: getEnv("SMTP_HOST", "smtp.gmail.com"),
			Port: getEnvInt("SMTP_PORT", 578),
			Email: getEnv("SMTP_EMAIL", ""),
			Password: getEnv("SMTP_PASSWORD", ""),
			FromName: getEnv("SMTP_FROM_NAME", "Multibrand"),	
		},
		Redis: RedisConfig{
			Addr:     getEnv("REDIS_ADDR", "localhost:6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       getEnvInt("REDIS_DB", 0),
		},
		Razorpay: RazorpayConfig{
			KeyID: getEnv("RAZORPAY_KEY_ID", ""),
			KeySecret: getEnv("RAZORPAY_KEY_SECRET", ""),
		},
	}, nil
}

// getEnv returns env value or fallback
func getEnv(key, defaultValue string) string {
	if val := os.Getenv(key); val != ""{
		return val
	}

	return defaultValue
}

//getEnv returns env value or fallback for integer
func getEnvInt(key string, defaultValue int) int {
	if val := os.Getenv(key); val != ""{
		if i, err := strconv.Atoi(val); err == nil{
			return i
		}
	}

	return defaultValue
}
