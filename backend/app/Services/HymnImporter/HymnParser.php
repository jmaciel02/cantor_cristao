<?php

namespace App\Services\HymnImporter;

class HymnParser
{
    public static function parse(int $number, string $rawTitle, string $rawText): array
    {
        // Extract title
        $title = trim(preg_replace('/^\d+\s*[-–—.]\s*/', '', $rawTitle));

        // Detect author/composer pattern
        $author = null;
        $composer = null;
        $text = trim($rawText);

        if (preg_match('/(?:[A-Z][a-zA-Z\s.,\'-]+(?:\(\d{4}[-–]?\d{0,4}\)))+$/', $text, $matches, PREG_OFFSET_CAPTURE)) {
            $authorBlob = trim($matches[0][0]);
            $text = trim(substr($text, 0, $matches[0][1]));

            $credits = preg_split('/(?<=\))\s+(?=[A-Z])/', $authorBlob);
            if (count($credits) >= 2) {
                $author = trim($credits[0]);
                $composer = trim($credits[1]);
            } else if (count($credits) === 1) {
                $author = trim($credits[0]);
            }
        }

        // Normalize choruses
        $textWithCoro = preg_replace('/\[coro\]/i', "\n\n[CORO]\n", $text);
        $blocks = preg_split('/\n{2,}|\s{3,}(?=[A-Z0-9\[])/', $textWithCoro);

        $stanzas = [];
        $verseCounter = 1;

        foreach ($blocks as $block) {
            $trimmedBlock = trim($block);
            if (empty($trimmedBlock)) continue;

            $isChorus = stripos($trimmedBlock, '[CORO]') === 0;
            $cleanBlock = trim(preg_replace('/^\[CORO\]\s*/i', '', $trimmedBlock));
            $lines = array_filter(array_map('trim', explode("\n", $cleanBlock)));

            if (!empty($lines)) {
                $stanzas[] = [
                    'number' => $isChorus ? null : $verseCounter++,
                    'is_chorus' => $isChorus,
                    'text' => implode("\n", $lines),
                    'lines' => array_values($lines)
                ];
            }
        }

        $firstLine = '';
        foreach ($stanzas as $s) {
            if (!empty($s['lines'])) {
                $firstLine = $s['lines'][0];
                break;
            }
        }

        $normalized = HymnNormalizer::normalizeSearchText("{$number} {$title} {$firstLine} {$text} {$author} {$composer}");
        $contentHash = hash('sha256', $normalized);

        return [
            'number' => $number,
            'title' => $title,
            'raw_title' => $rawTitle,
            'first_line' => $firstLine,
            'author' => $author,
            'composer' => $composer,
            'stanzas' => $stanzas,
            'lyrics' => $text,
            'lyrics_normalized' => $normalized,
            'content_hash' => $contentHash
        ];
    }
}
