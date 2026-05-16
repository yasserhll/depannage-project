<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@autodepan.fr'],
            [
                'name'               => 'Admin AutoDepan',
                'email'              => 'admin@autodepan.fr',
                'password'           => Hash::make(env('ADMIN_PASSWORD', 'Admin@2024!')),
                'role'               => 'admin',
                'status'             => 'active',
                'email_verified_at'  => now(),
            ]
        );

        $admin->getOrCreateWallet();

        $this->command->info("Admin créé : {$admin->email}");
    }
}
