package cloudinary

import (
	"context" //Context tells your program when to stop and shares request-related info.
	"fmt"
	"mime/multipart" //handle multipart data, especially file uploads in HTTP requests.

	"github.com/akhilbabu26/multibrand_database_4/internal/infrastructure/config"
	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

type ImageService interface {
	UploadImage(ctx context.Context, files multipart.File) (string, error)
	DeleteImage(ctx context.Context, publicID string) error
}

type cloudinaryService struct {
	client *cloudinary.Cloudinary
}

func NewCloudinaryService(cfg *config.Config) (ImageService, error) {
	if cfg.Cloudinary.CloudName == "" || cfg.Cloudinary.APIKey == "" || cfg.Cloudinary.APISecret == "" {
		return nil, fmt.Errorf("cloudinary credentials are not fully configured")
	}

	cld, err := cloudinary.NewFromParams(cfg.Cloudinary.CloudName, cfg.Cloudinary.APIKey, cfg.Cloudinary.APISecret)
	if err != nil {
		return nil, fmt.Errorf("faild to initialize cloudinary")
	}

	return &cloudinaryService{client: cld}, nil
}

func (s *cloudinaryService) UploadImage(ctx context.Context, file multipart.File) (string, error) {
	resp, err := s.client.Upload.Upload(ctx, file, uploader.UploadParams{
		Folder: "multibrand_product",
	})
	if err != nil {
		return "", fmt.Errorf("faild to upload image to cloudinary")
	}

	return resp.SecureURL, nil
}

func (s *cloudinaryService) DeleteImage(ctx context.Context, publicID string) error {
	_, err := s.client.Upload.Destroy(ctx, uploader.DestroyParams{PublicID: publicID})
	if err != nil {
		return fmt.Errorf("failed to delete image from cloudinary: %w", err)
	}
	return nil
}

// Context tells your program when to stop and shares request-related info.
// User cancels request → context tells all functions “stop now”
// Timeout happens → context tells “time’s up”
