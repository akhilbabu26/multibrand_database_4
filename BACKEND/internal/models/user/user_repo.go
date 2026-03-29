package domain


// UserRepository — database contract for user operations
type UserRepository interface{
	// user operations
	Create(user *User) error
	FindByID(id uint) (*User, error)
	FindByEmail(email string) (*User, error)
	Update(user *User) error
	ListUsers(page, limit int) ([]*User, int64, error)
	// block/unblock/delete operations
    BlockUser(id uint) error
    UnblockUser(id uint) error
	Delete(id uint) error

	//OTP operations
	SavePendingUser(p *PendingUser) error
    FindPendingByEmail(email string) (*PendingUser, error)
    DeletePendingByEmail(email string) error
    DeleteExpiredPending() error  // for cleanup job
}

// UserUsecase — business logic contract for auth operations
type UserUsecase interface{
	//user
	GetUser(id uint) (*User, error)

	// Admin user management  ← add these
	ListUsers(page, limit int) ([]*User, int64, error)
	BlockUser(id uint) error
	UnblockUser(id uint) error
	DeleteUser(id uint) error
}
