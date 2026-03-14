package bootstrap


import(
	"github.com/akhilbabu26/multibrand_database_4/internal/infrastructure/config"
	"github.com/akhilbabu26/multibrand_database_4/internal/infrastructure/database"
	"github.com/akhilbabu26/multibrand_database_4/pkg/email"
	"github.com/akhilbabu26/multibrand_database_4/pkg/redis"

	"gorm.io/gorm"
	goredis "github.com/redis/go-redis/v9" 
)

type App struct{
	Config *config.Config
	DB *gorm.DB
	Mailer *email.Mailer
	Redis *goredis.Client
	TokenStore *redis.TokenStore
}

func Initialize() (*App, error){
	// 1. Load config
	cfg, err := config.Load()
	if err != nil{
		return nil, err
	}

	// 2. Connect db
	db, err := database.NewPostgresDB(&cfg.Database)
	if err != nil{
		return nil, err
	}

	// 3. run migration
	if err := database.AutoMigrate(db); err != nil{
		return nil, err
	}

	// 4. connect redis
	redisClient, err := redis.NewRedisClient(cfg.Redis.Addr, cfg.Redis.Password, cfg.Redis.DB)
	if err != nil {
		return nil, err
	}

	// 5. Create token store
	tokenStore := redis.NewTokenStore(redisClient)

	mailer := email.NewMailer(&cfg.SMTP)

	return &App{
		Config: cfg, 
		DB: db,
		Mailer: mailer,
		Redis:  redisClient,
		TokenStore: tokenStore, 
	}, nil
}