package email

import (
	"bytes"
	"fmt"
	"html/template"

	"github.com/akhilbabu26/multibrand_database_4/internal/infrastructure/config"

	"gopkg.in/gomail.v2"
)

type Mailer struct{
	cfg *config.SMTPConfig
}

func NewMailer(cfg *config.SMTPConfig) *Mailer {
	return &Mailer{cfg: cfg}
}

// SendOTP sends a 6 digit OTP to the given email
func (m *Mailer) SendOTP(toEmail, name, otp string) error {
	subject := "Verify your Multibrand account"

	body, err := createOTPEmail(name, otp)
	if err != nil{
		return fmt.Errorf("failed to build email body: %w", err)
	}

	return m.send(toEmail, subject, body)
}

// send is a private helper that sends the actual email
func (m *Mailer) send(to, subject, body string) error {
	msg := gomail.NewMessage()

	msg.SetHeader("From", fmt.Sprintf("%s <%s>", m.cfg.FromName, m.cfg.Email))
	msg.SetHeader("To", to)
	msg.SetHeader("Subject", subject)
	msg.SetBody("text/html", body)

	dialer := gomail.NewDialer(
		m.cfg.Host,
		m.cfg.Port,
		m.cfg.Email,
		m.cfg.Password,
	)

	if err := dialer.DialAndSend(msg); err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}

func createOTPEmail(name, otp string) (string, error) {
	const tmpl = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
  <h2>Hello, {{.Name}}!</h2>
  <p>Thank you for signing up with <strong>Multibrand</strong>.</p>
  <p>Your OTP verification code is:</p>
  <div style="
    display: inline-block;
    font-size: 32px;
    font-weight: bold;
    letter-spacing: 8px;
    background: #f4f4f4;
    padding: 16px 32px;
    border-radius: 8px;
    margin: 16px 0;
  ">{{.OTP}}</div>
  <p>This code expires in <strong>10 minutes</strong>.</p>
  <p>If you didn't request this, please ignore this email.</p>
  <br/>
  <p>— The Multibrand Team</p>
</body>
</html>`

	t, err := template.New("otp").Parse(tmpl)
	if err != nil {
		return "", err
	}

	data := struct {
		Name string
		OTP  string
	}{
		Name: name,
		OTP:  otp,
	}

	var buf bytes.Buffer
	if err := t.Execute(&buf, data); err != nil {
		return "", err
	}

	return buf.String(), nil
}

