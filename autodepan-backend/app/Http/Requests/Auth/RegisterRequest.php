<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'                  => ['required', 'string', 'max:100', 'min:2'],
            'email'                 => ['nullable', 'email', 'unique:users,email'],
            'phone'                 => ['nullable', 'string', 'max:20', 'unique:users,phone'],
            'password'              => ['required', 'confirmed', Password::min(8)],
            'role'                  => ['required', 'in:client,depanneur'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (empty($this->email) && empty($this->phone)) {
                $validator->errors()->add('email', 'Un email ou un numéro de téléphone est requis.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'email.unique'   => 'Cette adresse email est déjà utilisée.',
            'phone.unique'   => 'Ce numéro de téléphone est déjà utilisé.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
        ];
    }
}
