import { useLanguages } from "../hooks";

export default function Home() {
  const { data, error, isPending } = useLanguages.get();
  return (
    <>
      <h1>Available Languages</h1>
      {isPending && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {data && (
        <ul>
          {data.map((lang) => (
            <li key={lang.code}>
              {lang.code} - {lang.name}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
