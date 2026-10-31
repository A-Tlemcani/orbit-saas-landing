import { test } from 'node:test';
import assert from 'node:assert/strict';
import { displayPrice, plans, yearlySavings } from './pricing.ts';

const team = plans.find((p) => p.id === 'team')!;
test('yearly billing is 20% cheaper, rounded', () => { assert.equal(displayPrice(team, 'monthly'), 49); assert.equal(displayPrice(team, 'yearly'), 39); });
test('free and custom plans', () => { assert.equal(displayPrice(plans[0], 'yearly'), 0); assert.equal(displayPrice(plans[2], 'yearly'), null); });
test('savings scale with seats', () => assert.equal(yearlySavings(team, 10), 1200));
test('exactly one featured plan', () => assert.equal(plans.filter((p) => p.featured).length, 1));
