import { usePrayerTimes } from "../hooks";

const Sample = () => {
  const Loading = () => (
    <div className="text-blue-500 font-semibold">Loading...</div>
  );
  const ErrorMessage = ({ message }: { message: string }) => (
    <div className="text-red-500 font-semibold">Error: {message}</div>
  );

  const { data, isPending, error } = usePrayerTimes.today(12);

  return (
    <div>
      <h1>Today's Prayer Times</h1>

      {isPending && <Loading />}
      {error && <ErrorMessage message={error.message} />}
      {data && !isPending && !error && (
        <ul className="flex-col">
          {Object.entries(data).map(([key, value], index) => (
            <li key={index}>
              {key}: {value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Sample;
