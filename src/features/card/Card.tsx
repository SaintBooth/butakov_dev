import CardIdentity from './CardIdentity';
import CardSaveContact from './CardSaveContact';

export default function Card() {
  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-col gap-6">
      <CardIdentity />
      <CardSaveContact />
    </div>
  );
}
