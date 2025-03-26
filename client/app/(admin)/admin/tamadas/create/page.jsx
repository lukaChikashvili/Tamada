import React from 'react'

export const metadata = {
    title: "თამადის დამატება | თამადა",
    description: "დაამატე ახალი თამადა",
  };

import React from 'react'
import AddTamadaForm from './_components/add-tamada-form';

export default function AddTamadaPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">დაამატე თამადა</h1>
            <AddTamadaForm />
        </div>
    )
}