import { ValidatorResult } from '../../types';
import { TubeNestingResult } from '../types';

export async function validateTubeNesting(): Promise<ValidatorResult> {
  const start = Date.now();
  
  try {
    const testCases = [
      { scenario: 'Exact cuts', tubeLength: 6000, cuts: [1500, 1500, 1500, 1500] },
      { scenario: 'Small leftovers', tubeLength: 6000, cuts: [1499, 1499, 1499, 1499] },
      { scenario: 'Overflowing bar lengths', tubeLength: 6000, cuts: [1600, 1600, 1600, 1600] },
      { scenario: 'Mixed lengths', tubeLength: 6000, cuts: [2000, 1500, 1000, 800] },
      { scenario: 'Single cut', tubeLength: 6000, cuts: [5000] },
      { scenario: 'Multiple small cuts', tubeLength: 6000, cuts: Array(20).fill(295) }
    ];

    const results: TubeNestingResult[] = [];

    for (const testCase of testCases) {
      const result = await runTubeNestingTest(testCase);
      results.push(result);
    }

    const passed = results.every(r => r.passed);
    const duration = Date.now() - start;

    return {
      status: passed ? 'passed' : 'failed',
      duration,
      details: {
        testCases: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        averageWaste: results.reduce((sum, r) => sum + r.waste, 0) / results.length,
        results
      }
    };
  } catch (error) {
    const duration = Date.now() - start;
    return {
      status: 'failed',
      duration,
      error: error.message
    };
  }
}

async function runTubeNestingTest(testCase: any): Promise<TubeNestingResult> {
  // Simulate tube nesting test
  const errors: string[] = [];
  let waste = 0;

  try {
    const totalCutLength = testCase.cuts.reduce((sum: number, cut: number) => sum + cut, 0);
    
    if (totalCutLength > testCase.tubeLength) {
      errors.push(`Total cut length (${totalCutLength}) exceeds tube length (${testCase.tubeLength})`);
    }

    waste = testCase.tubeLength - totalCutLength;
    
    // Check for negative waste (invalid)
    if (waste < 0) {
      errors.push(`Negative waste detected: ${waste.toFixed(2)}mm`);
    }

    // Check for exact cut
    if (waste === 0) {
      // Exact cut - valid
    }

    const passed = errors.length === 0;

    return {
      scenario: testCase.scenario,
      tubeLength: testCase.tubeLength,
      cuts: testCase.cuts,
      waste: parseFloat(waste.toFixed(2)),
      errors,
      passed
    };
  } catch (error) {
    return {
      scenario: testCase.scenario,
      tubeLength: testCase.tubeLength,
      cuts: testCase.cuts,
      waste: 0,
      errors: [error.message],
      passed: false
    };
  }
}