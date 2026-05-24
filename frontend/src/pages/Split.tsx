import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useSplitStore } from '@/state/splitStore';
import { useUserStore } from '@/state/userStore';
import { useSplit } from '@/hooks/useSplit';
import { formatCurrency } from '@/utils/upi';
import {
  ArrowRightIcon,
  BanknotesIcon,
  CalculatorIcon,
  PlusIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface ParticipantFormData {
  name: string;
  upiId?: string;
}

export const Split: React.FC = () => {
  const navigate = useNavigate();
  const seededUser = useRef(false);
  const { user } = useUserStore();
  const {
    billTotal,
    participants,
    setBillTotal,
    addParticipant,
    removeParticipant,
    calculateSplit,
  } = useSplitStore();
  const { createSplit, isCreating, createError } = useSplit();
  const { register, handleSubmit, reset } = useForm<ParticipantFormData>();
  const [hasCalculated, setHasCalculated] = useState(false);

  useEffect(() => {
    if (!seededUser.current && user?.name && participants.length === 0) {
      addParticipant(user.name);
      seededUser.current = true;
    }
  }, [addParticipant, participants.length, user?.name]);

  const splitPreview = useMemo(() => {
    if (participants.length === 0 || billTotal <= 0) {
      return [];
    }

    const totalPaisa = Math.round(billTotal * 100);
    const basePaisa = Math.floor(totalPaisa / participants.length);
    const remainderPaisa = totalPaisa - basePaisa * participants.length;

    return participants.map((participant, index) => ({
      ...participant,
      amount: (basePaisa + (index < remainderPaisa ? 1 : 0)) / 100,
    }));
  }, [billTotal, participants]);

  const totalInput = billTotal > 0 ? billTotal.toString() : '';
  const canCreate = billTotal > 0 && participants.length > 0;

  const onTotalChange = (value: string) => {
    const parsed = Number.parseFloat(value);
    setBillTotal(Number.isFinite(parsed) ? parsed : 0);
    setHasCalculated(false);
  };

  const onAddParticipant = (data: ParticipantFormData) => {
    addParticipant(data.name.trim(), data.upiId?.trim() || undefined);
    setHasCalculated(false);
    reset();
  };

  const onRemoveParticipant = (id: string) => {
    removeParticipant(id);
    setHasCalculated(false);
  };

  const handleCalculate = () => {
    calculateSplit();
    setHasCalculated(true);
  };

  const handleCreateSplit = () => {
    createSplit(
      {
        total_amount: billTotal,
        participants: participants.map((participant) => ({
          name: participant.name,
          upi_id: participant.upiId || undefined,
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
    <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="space-y-5">
        <Card className="bg-gradient-to-br from-primary-700 to-primary-500 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-white/70">Split bill</p>
              <p className="mt-2 text-4xl font-extrabold">{formatCurrency(billTotal)}</p>
            </div>
            <span className="rounded-lg bg-white/15 p-3">
              <BanknotesIcon className="h-7 w-7" />
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-white/14 p-3">
              <p className="text-xs font-semibold text-white/70">People</p>
              <p className="mt-1 text-2xl font-extrabold">{participants.length}</p>
            </div>
            <div className="rounded-lg bg-white/14 p-3">
              <p className="text-xs font-semibold text-white/70">Each starts at</p>
              <p className="mt-1 text-2xl font-extrabold">
                {splitPreview[0] ? formatCurrency(splitPreview[0].amount) : '₹0.00'}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <Input
            label="Total amount"
            inputMode="decimal"
            value={totalInput}
            onChange={(event) => onTotalChange(event.target.value)}
            placeholder="546.00"
          />

          <form onSubmit={handleSubmit(onAddParticipant)} className="mt-5 space-y-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <Input
                label="Name"
                {...register('name', { required: true, minLength: 2 })}
                placeholder="Aman"
              />
              <Input
                label="UPI ID"
                {...register('upiId')}
                placeholder="aman@upi"
              />
              <div className="flex items-end">
                <Button type="submit" variant="secondary" className="w-full sm:w-auto">
                  <PlusIcon className="mr-2 h-5 w-5" />
                  Add
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </section>

      <section className="space-y-5">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-500">People</p>
              <h1 className="font-display text-2xl font-extrabold tracking-normal text-ink">
                Equal split
              </h1>
            </div>
            <span className="rounded-lg bg-primary-50 p-2 text-primary-700">
              <UserGroupIcon className="h-6 w-6" />
            </span>
          </div>

          {participants.length > 0 ? (
            <div className="space-y-3">
              {splitPreview.map((participant, index) => (
                <div
                  key={participant.id}
                  className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-sm font-extrabold text-primary-700">
                    {participant.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-bold text-slate-900">{participant.name}</p>
                      {index === 0 && (
                        <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-700">
                          You
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm font-medium text-slate-500">
                      {participant.upiId || 'UPI optional'}
                    </p>
                  </div>
                  <p className="text-right font-extrabold text-primary-700">
                    {hasCalculated ? formatCurrency(participant.amount) : 'Pending'}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveParticipant(participant.id)}
                    aria-label={`Remove ${participant.name}`}
                    className="text-rose-600 hover:bg-rose-50"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <UserGroupIcon className="mx-auto h-10 w-10 text-slate-400" />
              <p className="mt-3 font-bold text-slate-900">Add people to split</p>
            </div>
          )}

          {createError && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
              Could not create split. Check participant names and UPI IDs.
            </div>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Button type="button" variant="secondary" onClick={handleCalculate} disabled={!canCreate}>
              <CalculatorIcon className="mr-2 h-5 w-5" />
              Calculate
            </Button>
            <Button
              type="button"
              onClick={handleCreateSplit}
              loading={isCreating}
              disabled={!canCreate}
            >
              Split now
              {!isCreating && <ArrowRightIcon className="ml-2 h-5 w-5" />}
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
};
