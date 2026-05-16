<?php

namespace App\Http\Controllers\Api\Depanneur;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Resources\WalletResource;
use App\Http\Resources\WalletTransactionResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $wallet = $request->user()->getOrCreateWallet();

        return response()->json([
            'wallet' => new WalletResource($wallet),
        ]);
    }

    public function transactions(Request $request): JsonResponse
    {
        $wallet = $request->user()->getOrCreateWallet();

        $transactions = $wallet->transactions()
            ->latest('created_at')
            ->paginate(30);

        return response()->json([
            'transactions' => WalletTransactionResource::collection($transactions->items()),
            'pagination'   => [
                'current_page' => $transactions->currentPage(),
                'last_page'    => $transactions->lastPage(),
                'total'        => $transactions->total(),
            ],
        ]);
    }

    public function requestWithdrawal(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:10',
            'iban'   => 'required|string|max:50',
        ]);

        $wallet = $request->user()->getOrCreateWallet();

        if ($request->amount > $wallet->balance) {
            throw new ApiException(
                'Solde insuffisant.',
                'INSUFFICIENT_BALANCE',
                422
            );
        }

        // En MVP: créer une transaction de retrait en attente
        // Production: intégrer Stripe Payouts ou virement SEPA
        $wallet->transactions()->create([
            'type'          => 'withdrawal',
            'amount'        => -$request->amount,
            'balance_after' => $wallet->balance - $request->amount,
            'reference'     => 'WITHDRAWAL-' . strtoupper(uniqid()),
            'description'   => 'Demande de retrait vers ' . $request->iban,
        ]);

        $wallet->decrement('balance', $request->amount);

        return response()->json([
            'message' => 'Demande de retrait enregistrée. Traitement sous 2-3 jours ouvrés.',
        ]);
    }
}
