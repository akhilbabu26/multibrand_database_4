package usecase

import (
	"context"
	"mime/multipart"

	"github.com/akhilbabu26/multibrand_database_4/internal/models/contracts"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/dto"
	"github.com/akhilbabu26/multibrand_database_4/internal/models/entities"
	"github.com/akhilbabu26/multibrand_database_4/pkg/cloudinary"
	apperrors "github.com/akhilbabu26/multibrand_database_4/pkg/errors"
)

type productUsecase struct {
	repo         contracts.ProductRepository
	cartRepo     contracts.CartRepository
	wishlistRepo contracts.WishlistRepository
	imageService cloudinary.ImageService
}

func NewProductUsecase(
	repo contracts.ProductRepository,
	cartRepo contracts.CartRepository,
	wishlistRepo contracts.WishlistRepository,
	imageService cloudinary.ImageService,
) contracts.ProductUsecase {
	return &productUsecase{
		repo:         repo,
		cartRepo:     cartRepo,
		wishlistRepo: wishlistRepo,
		imageService: imageService,
	}
}

// uploadImage opens, uploads, and closes a single file header.
// Scoping defer inside a helper prevents the file-handle leak that occurs
// when defer is used inside a for-loop in the caller.
func (u *productUsecase) uploadImage(ctx context.Context, fh *multipart.FileHeader) (string, error) {
	file, err := fh.Open()
	if err != nil {
		return "", apperrors.Internal("failed to open image file", err)
	}
	defer file.Close()

	url, err := u.imageService.UploadImage(ctx, file)
	if err != nil {
		return "", apperrors.Internal("failed to upload image", err)
	}
	return url, nil
}

// uploadImages uploads all files and rolls back (deletes from Cloudinary) any
// already-uploaded images if a later upload fails.
func (u *productUsecase) uploadImages(ctx context.Context, fileHeaders []*multipart.FileHeader) ([]string, error) {
	uploaded := make([]string, 0, len(fileHeaders))

	for _, fh := range fileHeaders {
		url, err := u.uploadImage(ctx, fh)
		if err != nil {
			// Best-effort cleanup of images that were already uploaded.
			for _, uploadedURL := range uploaded {
				_ = u.imageService.DeleteImage(ctx, uploadedURL)
			}
			return nil, err
		}
		uploaded = append(uploaded, url)
	}
	return uploaded, nil
}

func (u *productUsecase) CreateProduct(ctx context.Context, req dto.CreateProductRequest) error {
	product := &entities.Product{
		Name:               req.Name,
		Brand:              req.Brand,
		Type:               req.Type,
		Color:              req.Color,
		Size:               req.Size,
		Gender:             req.Gender,
		CostPrice:          req.CostPrice,
		OriginalPrice:      req.OriginalPrice,
		DiscountPercentage: req.DiscountPercentage,
		Description:        req.Description,
		Stock:              req.Stock,
		IsActive:           true,
	}
	product.CalculateSalePrice()

	if len(req.Images) > 0 {
		urls, err := u.uploadImages(ctx, req.Images)
		if err != nil {
			return err
		}

		images := make([]entities.ProductImage, 0, len(urls))
		for i, url := range urls {
			images = append(images, entities.ProductImage{
				ImageURL:  url,
				IsPrimary: i == 0,
			})
		}
		product.Images = images
	}

	return u.repo.Create(ctx, product)
}

func (u *productUsecase) UpdateProduct(ctx context.Context, id uint, req dto.UpdateProductRequest) error {
	product, err := u.repo.FindByID(ctx, id)
	if err != nil {
		return err // already an AppError
	}

	if req.Name != nil {
		product.Name = *req.Name
	}
	if req.Brand != nil {
		product.Brand = *req.Brand
	}
	if req.Type != nil {
		product.Type = *req.Type
	}
	if req.Color != nil {
		product.Color = *req.Color
	}
	if req.Size != nil {
		product.Size = *req.Size
	}
	if req.Gender != nil {
		product.Gender = *req.Gender
	}
	if req.CostPrice != nil {
		product.CostPrice = *req.CostPrice
	}
	if req.OriginalPrice != nil {
		product.OriginalPrice = *req.OriginalPrice
	}
	if req.DiscountPercentage != nil {
		product.DiscountPercentage = *req.DiscountPercentage
	}
	if req.Description != nil {
		product.Description = *req.Description
	}
	if req.Stock != nil {
		product.Stock = *req.Stock
	}
	if req.IsActive != nil {
		product.IsActive = *req.IsActive
	}

	product.CalculateSalePrice()

	if len(req.DeleteImageIDs) > 0 {
		var updatedImages []entities.ProductImage
		for _, img := range product.Images {
			shouldDelete := false
			for _, deleteID := range req.DeleteImageIDs {
				if img.ID == deleteID {
					shouldDelete = true
					break
				}
			}

			if shouldDelete {
				// Delete from Cloudinary
				_ = u.imageService.DeleteImage(ctx, img.ImageURL)
				// Delete from DB
				if err := u.repo.DB().WithContext(ctx).Unscoped().Delete(&entities.ProductImage{}, img.ID).Error; err != nil {
					// Logic check: if it fails, maybe log but continue?
					// For now let's just log or ignore if it's already gone.
				}
			} else {
				updatedImages = append(updatedImages, img)
			}
		}
		product.Images = updatedImages
	}

	if len(req.Images) > 0 {
		urls, err := u.uploadImages(ctx, req.Images)
		if err != nil {
			return err
		}

		newImages := make([]entities.ProductImage, 0, len(urls))
		for i, url := range urls {
			newImages = append(newImages, entities.ProductImage{
				ProductID: product.ID,
				ImageURL:  url,
				// Only mark as primary if the product currently has no images
				// and this is the first one being added.
				IsPrimary: len(product.Images) == 0 && i == 0,
			})
		}
		product.Images = append(product.Images, newImages...)
	}

	return u.repo.Update(ctx, product)
}

func (u *productUsecase) DeleteProduct(ctx context.Context, id uint) error {
	// repo.Delete now checks RowsAffected and returns NotFound itself,
	// so a pre-flight FindByID is no longer needed.
	return u.repo.Delete(ctx, id)
}

func (u *productUsecase) GetProduct(ctx context.Context, id uint) (*entities.Product, error) {
	return u.repo.FindByID(ctx, id)
}

func (u *productUsecase) ListProducts(ctx context.Context, filters dto.ProductFilter) ([]*entities.Product, int64, error) {
	return u.repo.ListAll(ctx, filters)
}

func (u *productUsecase) GetProductForCustomer(ctx context.Context, id uint, userID *uint) (*dto.CustomerProductResponse, error) {
	product, err := u.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	resp := dto.ToCustomerProductResponse(product)
	if userID != nil {
		resp.IsCart = u.cartRepo.IsInCart(*userID, product.ID)
		resp.IsWishlist = u.wishlistRepo.IsInWishlist(*userID, product.ID)
	}

	return resp, nil
}

func (u *productUsecase) ListProductsForCustomer(ctx context.Context, filters dto.ProductFilter, userID *uint) ([]*dto.CustomerProductResponse, int64, error) {
	products, total, err := u.repo.ListAll(ctx, filters)
	if err != nil {
		return nil, 0, err
	}

	var response []*dto.CustomerProductResponse
	for _, p := range products {
		resp := dto.ToCustomerProductResponse(p)
		if userID != nil {
			resp.IsCart = u.cartRepo.IsInCart(*userID, p.ID)
			resp.IsWishlist = u.wishlistRepo.IsInWishlist(*userID, p.ID)
		}
		response = append(response, resp)
	}

	return response, total, nil
}

func (u *productUsecase) GetProductVariantsForCustomer(ctx context.Context, id uint, userID *uint) ([]*dto.CustomerProductResponse, error) {
	variants, err := u.repo.GetProductVariants(ctx, id)
	if err != nil {
		return nil, err
	}

	var response []*dto.CustomerProductResponse
	for _, p := range variants {
		resp := dto.ToCustomerProductResponse(p)
		if userID != nil {
			resp.IsCart = u.cartRepo.IsInCart(*userID, p.ID)
			resp.IsWishlist = u.wishlistRepo.IsInWishlist(*userID, p.ID)
		}
		response = append(response, resp)
	}

	return response, nil
}

func (u *productUsecase) GetProductMetadata(ctx context.Context) (*dto.ProductMetadataResponse, error) {
	return u.repo.GetProductMetadata(ctx)
}
