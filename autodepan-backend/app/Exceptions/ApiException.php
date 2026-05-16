<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class ApiException extends Exception
{
    public function __construct(
        string $message,
        private readonly string $errorCode = 'ERROR',
        int $httpStatus = 400,
        private readonly array $errors = []
    ) {
        parent::__construct($message, $httpStatus);
    }

    public function getErrors(): array
    {
        return $this->errors;
    }

    public function render(): JsonResponse
    {
        $data = [
            'message'    => $this->getMessage(),
            'error_code' => $this->errorCode,
        ];

        if (!empty($this->errors)) {
            $data['errors'] = $this->errors;
        }

        return response()->json($data, $this->getCode() ?: 400);
    }
}
