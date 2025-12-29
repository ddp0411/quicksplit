// Split page
import { useState } from 'react';
import { useSplit } from '../hooks/useSplit';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Split = () => {
  const [participants, setParticipants] = useState<string[]>(['']);
  const { createSplit, isLoading } = useSplit();

  const handleAddParticipant = () => {
    setParticipants([...participants, '']);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Split Bill</h1>
      <div className="space-y-4">
        {participants.map((_, index) => (
          <Input
            key={index}
            label={`Participant ${index + 1}`}
            placeholder="Enter name or UPI ID"
          />
        ))}
        <Button onClick={handleAddParticipant}>Add Participant</Button>
        <Button onClick={() => createSplit({})} disabled={isLoading}>
          Create Split
        </Button>
      </div>
    </div>
  );
};

