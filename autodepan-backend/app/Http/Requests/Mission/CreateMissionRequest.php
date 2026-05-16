<?php

namespace App\Http\Requests\Mission;

use Illuminate\Foundation\Http\FormRequest;

class CreateMissionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'client_lat'        => ['required', 'numeric', 'between:-90,90'],
            'client_lng'        => ['required', 'numeric', 'between:-180,180'],
            'client_address'    => ['nullable', 'string', 'max:500'],
            'breakdown_type'    => ['required', 'string', 'max:100'],
            'breakdown_details' => ['nullable', 'string', 'max:1000'],
            'vehicle_brand'     => ['nullable', 'string', 'max:100'],
            'vehicle_model'     => ['nullable', 'string', 'max:100'],
            'vehicle_year'      => ['nullable', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            'vehicle_plate'     => ['nullable', 'string', 'max:20'],
            'client_notes'      => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'client_lat.required'    => 'La latitude est requise.',
            'client_lng.required'    => 'La longitude est requise.',
            'breakdown_type.required' => 'Le type de panne est requis.',
        ];
    }
}
