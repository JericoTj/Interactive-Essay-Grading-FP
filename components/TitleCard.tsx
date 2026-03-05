export default function TitleCard({ title }: { title: string }) {
  return (
    <div className="title-card">
      <h1 className="title-card-text">{title}</h1>
    </div>
  );
}
