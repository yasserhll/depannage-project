<?php

namespace App\Http\Requests\Upload;

use Illuminate\Foundation\Http\FormRequest;

class DocumentUploadRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'type' => ['required', 'in:carte_identite,permis_conduire,carte_grise,assurance,kbis,selfie_verification'],
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'], // 5 Mo max
        ];
    }

    public function messages(): array
    {
        return [
            'file.mimes' => 'Le document doit être au format JPG, PNG ou PDF.',
            'file.max'   => 'Le fichier ne doit pas dépasser 5 Mo.',
        ];
    }
}
