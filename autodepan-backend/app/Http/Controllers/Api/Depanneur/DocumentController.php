<?php

namespace App\Http\Controllers\Api\Depanneur;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Upload\DocumentUploadRequest;
use App\Http\Resources\DocumentResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $documents = $request->user()->documents()->latest()->get();

        return response()->json([
            'documents' => DocumentResource::collection($documents),
        ]);
    }

    public function upload(DocumentUploadRequest $request): JsonResponse
    {
        $user = $request->user();
        $file = $request->file('file');

        $hash = hash_file('sha256', $file->getRealPath());

        $existing = $user->documents()
            ->where('file_hash', $hash)
            ->exists();

        if ($existing) {
            throw new ApiException('Ce fichier a déjà été téléchargé.', 'DUPLICATE_FILE', 422);
        }

        $path = $file->store("documents/{$user->id}", 'public');

        $document = $user->documents()->create([
            'type'      => $request->type,
            'file_path' => $path,
            'file_hash' => $hash,
            'status'    => 'pending',
        ]);

        // Met à jour le statut KYC si pas encore en review
        $profile = $user->depanneurProfile;
        if ($profile && $profile->kyc_status === 'pending') {
            $profile->update(['kyc_status' => 'in_review']);
        }

        return response()->json([
            'message'  => 'Document téléchargé avec succès.',
            'document' => new DocumentResource($document),
        ], 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $document = $request->user()
            ->documents()
            ->where('id', $id)
            ->where('status', 'pending')
            ->firstOrFail();

        \Illuminate\Support\Facades\Storage::disk('public')->delete($document->file_path);
        $document->delete();

        return response()->json(['message' => 'Document supprimé.']);
    }
}
