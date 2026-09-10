import CardIdentity from './CardIdentity';
import CardSaveContact from './CardSaveContact';
import CardFork from './CardFork';

export default function Card() {
  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-col gap-6">
      <CardIdentity />
      <CardSaveContact />
      <CardFork />
    </div>
  );
}
