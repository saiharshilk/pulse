// Converts stored metric values for display, and converts typed-in imperial values back.
// Everything is stored metric; units only change what's shown.
import type { Units } from '@/types/settings';

const CM_PER_INCH = 2.54;
const INCHES_PER_FOOT = 12;
const KG_PER_LB = 0.45359237;
const METERS_PER_MILE = 1609.344;

export function cmToInches(cm: number): number {
  return cm / CM_PER_INCH;
}

export function inchesToCm(inches: number): number {
  return inches * CM_PER_INCH;
}

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

// → "175 cm" or "5 ft 9 in"
export function formatHeight(cm: number, units: Units): string {
  if (units === 'metric') return `${Math.round(cm)} cm`;
  const totalInches = Math.round(cmToInches(cm));
  return `${Math.floor(totalInches / INCHES_PER_FOOT)} ft ${totalInches % INCHES_PER_FOOT} in`;
}

// → "75 kg" or "165 lb"
export function formatWeight(kg: number, units: Units): string {
  return units === 'metric' ? `${Math.round(kg)} kg` : `${Math.round(kgToLb(kg))} lb`;
}

// → "7.5 km" or "4.7 mi"
// TODO(spec): no screen shows distance yet; this is ready for when one does.
export function formatDistance(meters: number, units: Units): string {
  return units === 'metric' ? `${(meters / 1000).toFixed(1)} km` : `${(meters / METERS_PER_MILE).toFixed(1)} mi`;
}

// What an edit field shows for a stored value: centimeters or total inches, kilograms or pounds.
export function heightForInput(cm: number, units: Units): number {
  return Math.round(units === 'metric' ? cm : cmToInches(cm));
}

export function weightForInput(kg: number, units: Units): number {
  return Math.round(units === 'metric' ? kg : kgToLb(kg));
}

// Converts what was typed back to the stored metric value.
export function heightFromInput(value: number, units: Units): number {
  return units === 'metric' ? value : inchesToCm(value);
}

export function weightFromInput(value: number, units: Units): number {
  return units === 'metric' ? value : lbToKg(value);
}
