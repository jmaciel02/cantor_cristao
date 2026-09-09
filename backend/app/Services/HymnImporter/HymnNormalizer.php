<?php

namespace App\Services\HymnImporter;

class HymnNormalizer
{
    public static function removeDiacritics(string $text): string
    {
        $normalized = normalizer_normalize($text, \Normalizer::FORM_D);
        if ($normalized === false) {
            return $text;
        }
        return preg_replace('/[\x{0300}-\x{036f}]/u', '', $normalized);
    }

    public static function normalizeSearchText(string $text): string
    {
        $clean = self::removeDiacritics($text);
        $clean = mb_strtolower($clean, 'UTF-8');
        $clean = preg_replace('/[^a-z0-9\s]/', ' ', $clean);
        return trim(preg_replace('/\s+/', ' ', $clean));
    }

    public static function sanitize(string $text): string
    {
        return trim(strip_tags($text));
    }
}
