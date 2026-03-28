package hash

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

const cost = bcrypt.DefaultCost // 10 rounds

// HashPassword 
func HashPassword(password string) (string, error){
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), cost)
	if err != nil{
		return "", fmt.Errorf("faild to hash password: %w", err)
	}
	return string(hashed), nil
}

//Check hashed password
func CheckPassword(plain, hashed string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashed), []byte(plain))
	return err == nil
}
