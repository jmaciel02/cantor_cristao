<?php

namespace App\Services\HymnImporter;

class HymnValidator
{
    public static function validate(array $data): array
    {
        $errors = [];

        if (!isset($data['number']) || !is_numeric($data['number']) || $data['number'] < 1 || $data['number'] > 581) {
            $errors[] = 'Número do hino inválido (deve ser entre 1 e 581).';
        }

        if (empty($data['title'])) {
            $errors[] = 'Título do hino não pode ser vazio.';
        }

        if (empty($data['stanzas']) || !is_array($data['stanzas'])) {
            $errors[] = 'O hino deve possuir pelo menos uma estrofe.';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
}
