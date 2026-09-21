import "./Footer.css";

export default function Footer() {
  return (
    <footer className="contact" id="contact">
      <h2>Contact</h2>
      <dl className="details">
        <div>
          <dt>Studio</dt>
          <dd>Mali Keli</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>
            <a href="mailto:hello@mali.keli">hello@mali.keli</a>
          </dd>
        </div>
        <div>
          <dt>Instagram</dt>
          <dd>
            <a href="https://instagram.com/mali.keli" rel="noreferrer">
              @mali.keli
            </a>
          </dd>
        </div>
        <div>
          <dt>Inquiries</dt>
          <dd>Commissions, exhibitions, and studio visits.</dd>
        </div>
      </dl>
      <p className="note">
        Replace the email and social with your live details whenever you are
        ready.
      </p>
    </footer>
  );
}
