import { Equation } from '../types';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

// Type to handle Prisma's null vs TypeScript's undefined
type PrismaEquation = Omit<Equation, 'description'> & {
  description: string | null;
};

// Convert Prisma equation to our Equation type
function convertPrismaEquation(prismaEquation: PrismaEquation): Equation {
  const { description, ...rest } = prismaEquation;
  return {
    ...rest,
    description: description ?? undefined
  };
}

export class EquationsService {
  async convertSpeechToLatex(text: string): Promise<string> {
    try {
      // Use OpenAI to convert natural language to LaTeX
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Convert natural language mathematical expressions to LaTeX notation. Return only the LaTeX code without any explanation.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const data = response.data as { choices: Array<{ message: { content: string } }> };
      return data.choices[0].message.content.trim();
    } catch (err) {
      console.error('Error converting speech to LaTeX:', err);
      throw new Error('Failed to convert speech to LaTeX');
    }
  }

  async saveEquation(userId: string, equation: Omit<Equation, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Equation> {
    const prismaEquation = await prisma.equation.create({
      data: {
        userId,
        latex: equation.latex,
        displayMode: equation.displayMode,
        description: equation.description ?? null,
        number: equation.number
      }
    });
    return convertPrismaEquation(prismaEquation as PrismaEquation);
  }

  async getEquations(userId: string): Promise<Equation[]> {
    const prismaEquations = await prisma.equation.findMany({
      where: { userId },
      orderBy: { number: 'asc' }
    });
    return prismaEquations.map((eq: PrismaEquation) => convertPrismaEquation(eq));
  }

  async updateEquation(userId: string, id: string, equation: Partial<Omit<Equation, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Equation> {
    const prismaEquation = await prisma.equation.update({
      where: { id_userId: { id, userId } },
      data: {
        ...equation,
        description: equation.description ?? null
      }
    });
    return convertPrismaEquation(prismaEquation as PrismaEquation);
  }

  async deleteEquation(userId: string, id: string): Promise<void> {
    await prisma.equation.delete({
      where: { id_userId: { id, userId } }
    });
  }
} 