package entities

import (
	"time"
)

type Size string
type Gender string

const (
	Size38 Size = "38"
	Size39 Size = "39"
	Size40 Size = "40"
	Size41 Size = "41"
	Size42 Size = "42"
	Size43 Size = "43"
	Size44 Size = "44"

	GenderMen    Gender = "men"
	GenderWomen  Gender = "women"
	GenderUnisex Gender = "unisex"
	GenderKids   Gender = "kids"
)

type ProductImage struct {
	ID        uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	ProductID uint   `gorm:"index" json:"product_id"`
	ImageURL  string `gorm:"not null" json:"image_url"`
	IsPrimary bool   `gorm:"default:false" json:"is_primary"`
}

type Product struct {
	ID                 uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	Name               string         `gorm:"not null" json:"name"`
	Type               string         `gorm:"index;not null" json:"type"`
	Color              string         `gorm:"index" json:"color"`
	Size               Size           `gorm:"type:varchar(10)" json:"size"`
	Gender             Gender         `gorm:"index;type:varchar(10)" json:"gender"`
	CostPrice          float64        `gorm:"not null" json:"cost_price"`
	OriginalPrice      float64        `gorm:"not null" json:"original_price"`
	DiscountPercentage float64        `gorm:"default:0" json:"discount_percentage"`
	SalePrice          float64        `gorm:"index;not null" json:"sale_price"`
	Images             []ProductImage `gorm:"foreignKey:ProductID;constraint:OnDelete:CASCADE;" json:"images"`
	Description        string         `json:"description"`
	Stock              int            `gorm:"index;default:0" json:"stock"`
	IsActive           bool           `gorm:"index;default:true" json:"is_active"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
}

func (p *Product) CalculateSalePrice() {
	if p.DiscountPercentage > 0 {
		p.SalePrice = p.OriginalPrice - (p.OriginalPrice * p.DiscountPercentage / 100)
	} else {
		p.SalePrice = p.OriginalPrice
	}
}
