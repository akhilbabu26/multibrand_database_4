package dto

type UserFilter struct {
	Search    string
	Role      string
	IsBlocked *bool
	Page      int
	Limit     int
}
