import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    const { checkUserQuota } = await import('@/lib/quota');
    const quotaResult = await checkUserQuota(session.userId, 'scan');
    if (!quotaResult.allowed) {
      return NextResponse.json(
        {
          error: quotaResult.reason || "403 Limit Exhausted: Daily limit exceeded.",
          limitExhausted: true,
        },
        { status: 403 }
      );
    }

    const { fileName } = await req.json();

    let scanResult = "Scanned Grade 11 Physics Equation: F = G*(m1*m2)/r^2. Explanation: This is Newton's Law of Universal Gravitation. The force of attraction is directly proportional to the product of their masses and inversely proportional to the square of the distance between them.";
    
    if (fileName && fileName.toLowerCase().includes('chemistry')) {
      scanResult = "Scanned Grade 11 Chemistry Reaction: aA + bB -> cC + dD. Rate = k[A]^x[B]^y. Explanation: This is the Rate Law equation. The reaction rate depends on the rate constant (k) and the concentrations of reactants raised to their respective reaction orders (x and y) determined experimentally.";
    } else if (fileName && fileName.toLowerCase().includes('math')) {
      scanResult = "Scanned Grade 11 Mathematics Determinant: det(A) = ad - bc. Explanation: For a 2x2 matrix, the determinant represents the scaling factor of the linear transformation. If it is non-zero, the matrix is invertible.";
    }

    return NextResponse.json({
      success: true,
      scanResult,
    });
  } catch (error: any) {
    console.error('Homework scanner error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 550 });
  }
}
