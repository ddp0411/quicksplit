import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useSplitStore } from '@/state/splitStore';
import { useSplit } from '@/hooks/useSplit';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export const Split: React.FC = () => {
  const navigate = useNavigate();
  const { billTotal, participants, addParticipant, removeParticipant, calculateSplit } = useSplitStore();
  const { createSplit, isCreating } = useSplit();
  const { register, handleSubmit, reset } = useForm();
  const [hasCalculated, setHasCalculated] = useState(false);

  const onAddParticipant = (data: { name: string; upiId?: string }) => {
    addParticipant(data.name, data.upiId);
    reset();
  };

  const handleCalculate = () => {
    calculateSplit();
    setHasCalculated(true);
  };

  const handleCreateSplit = () => {
    createSplit(
      {
        total_amount: billTotal,
        participants: participants.map(p => ({
          name: p.name,
          upi_id: p.upiId,
        })),
        split_type: 'equal',
      },
      {
        onSuccess: (data) => {
          navigate(`/review/${data.split_id}`);
        },
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center">Split the Bill</h1>

      <Card>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Amount
          </label>
          <div className="text-4xl font-bold text-primary-600">
            ₹{billTotal.toFixed(2)}
          </div>
        </div>

        <form onSubmit={handleSubmit(onAddParticipant)} className="space-y-4">
          <Input
            label="Participant Name"
            {...register('name', { required: true })}
            placeholder="Enter name"
          />
          <Input
            label="UPI ID (Optional)"
            {...register('upiId')}
            placeholder="username@bank"
          />
          <Button type="submit" variant="secondary" className="w-full">
            <PlusIcon className="h-5 w-5 mr-2 inline" />
            Add Participant
          </Button>
        </form>
      </Card>

      {participants.length > 0 && (
        <Card>
          <h2 className="text-2xl font-bold mb-4">Participants ({participants.length})</h2>
          
          <div className="space-y-3">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-semibold">{participant.name}</div>
                  {participant.upiId && (
                    <div className="text-sm text-gray-600">{participant.upiId}</div>
                  )}
                  {hasCalculated && (
                    <div className="text-lg font-bold text-primary-600 mt-1">
                      ₹{participant.amount.toFixed(2)}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeParticipant(participant.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {!hasCalculated ? (
              <Button onClick={handleCalculate} className="w-full">
                Calculate Split
              </Button>
            ) : (
              <Button
                onClick={handleCreateSplit}
                loading={isCreating}
                className="w-full"
              >
                Generate Payment Links
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
