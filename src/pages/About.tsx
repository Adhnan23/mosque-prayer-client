import { useEffect, useState } from "react";

const Loading = () => {
  return <div className="text-blue-500 font-semibold">Loading...</div>;
};

const ErrorMessage = ({ message }: { message: string }) => {
  return <div className="text-red-500 font-semibold">Error: {message}</div>;
};

const About = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTodayPrayerTimes = async () => {
      try {
        setLoading(true);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const res = await fetch("/api/prayer/today?format=14");
        const data = await res.json();
        if (!data.success)
          if (data.error !== null || data.error.length !== 0) {
            const simpleErrors = data.error.join(", ");
            throw new Error(simpleErrors);
          } else {
            throw new Error(data.message);
          }
        setData(data.data[0]);
        setError(null);
      } catch (error: any) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayPrayerTimes();
  }, []);

  return (
    <>
      <h1>Test Data</h1>
      {loading && <Loading />}
      {error && <ErrorMessage message={error} />}
      {!loading && !error && data && (
        <ul className="flex-col">
          {Object.entries(data).map(([key, value], index) => (
            <li key={index}>{`${key}: ${value}`}</li>
          ))}
        </ul>
      )}
    </>
  );
};

export default About;
