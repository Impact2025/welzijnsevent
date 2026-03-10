export default function VerifyPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-sand p-8 text-center">
        <div className="w-14 h-14 bg-forest-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
          📬
        </div>
        <h2 className="text-xl font-bold text-ink mb-2">Check je inbox</h2>
        <p className="text-sm text-ink-muted leading-relaxed">
          We hebben een inloglink naar je e-mailadres gestuurd.
          Klik op de link om in te loggen bij Bijeen.
        </p>
        <p className="text-xs text-ink-muted mt-4">
          De link is 15 minuten geldig.
        </p>
      </div>
    </div>
  );
}
