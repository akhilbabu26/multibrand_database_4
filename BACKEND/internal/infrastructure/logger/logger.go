package logger

import (
	"os"

	"go.uber.org/zap"         // use to create and write logs.
	"go.uber.org/zap/zapcore" //How logs are formatted
)

// NewLogger creates an enterprise-ready structured JSON logger
func NewLogger() (*zap.Logger, error) {
	encoderConfig := zap.NewProductionEncoderConfig() // create log format
	encoderConfig.TimeKey = "timestamp"               // costomized feilds in log format
	encoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	encoderConfig.MessageKey = "msg"
	encoderConfig.LevelKey = "level"

	level := zap.InfoLevel // if production level is info
	if os.Getenv("APP_ENV") == "development" {
		level = zap.DebugLevel // in development time detail logs and debug if not only info and err
	}

	core := zapcore.NewCore( // core of logger
		zapcore.NewJSONEncoder(encoderConfig), // want to be in json format
		zapcore.AddSync(os.Stdout),            // show in terminal
		level,
	)

	logger := zap.New(
		core,
		zap.AddCaller(),                   // shows file & line number
		zap.AddStacktrace(zap.ErrorLevel), //shows stack trace for errors
	)

	return logger, nil
}
