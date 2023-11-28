'use server';

import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { CustomersTable } from "./definitions";

const prisma: PrismaClient = new PrismaClient();
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries())
  const { customerId, amount, status } = CreateInvoice.parse(rawFormData);
  const amountInCents = amount * 100;
  
  await prisma.invoices.create({
    data: {
      customer_id: customerId,
      amount: amountInCents,
      status,
      date: new Date().toISOString()
    }
  })
  await prisma.$disconnect();
  
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries())
  const { customerId, amount, status } = UpdateInvoice.parse(rawFormData);
  const amountInCents = amount * 100;
  
  await prisma.invoices.update({
    where: { id },
    data: {
      customer_id: customerId,
      amount: amountInCents,
      status
    }
  });
  await prisma.$disconnect();
  
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  await prisma.invoices.delete({ where: { id } });
  await prisma.$disconnect();
  revalidatePath('/dashboard/invoices');
}