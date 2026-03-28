package database

import "gorm.io/gorm"

type TransactionManager interface{
	ExecuteTx(fu func(tx *gorm.DB) error) error
}

type gormTxManager struct{
	db *gorm.DB
}

func NewTransactionManager(db *gorm.DB) TransactionManager{
	return &gormTxManager{db: db}
}

func (g *gormTxManager) ExecuteTx(fn func(tx *gorm.DB) error) error{
	return g.db.Transaction(fn)
}