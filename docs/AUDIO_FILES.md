# Audio Files Documentation

## Overview

KMC Mama's Circle supports audio instructions for low-literacy users in the following languages:
- **tw** - Twi
- **ga** - Ga  
- **ew** - Ewe

English (en) users do not receive audio prompts as they can read the UI text.

## File Structure

Place audio files in:
\`\`\`
/public/audio/{locale}/{key}.mp3
\`\`\`

Example:
\`\`\`
/public/audio/tw/start-kmc.mp3
/public/audio/ga/start-kmc.mp3
/public/audio/ew/start-kmc.mp3
\`\`\`

## Required Audio Keys

### Navigation & Common Actions
| Key | Description | Suggested Script |
|-----|-------------|------------------|
| `select-language` | Prompt to select language | "Select your preferred language" |
| `save` | Save button | "Press to save" |
| `back` | Back/return | "Go back" |
| `next` | Continue/next | "Continue to next step" |
| `cancel` | Cancel action | "Cancel" |

### KMC Timer
| Key | Description | Suggested Script |
|-----|-------------|------------------|
| `start-kmc` | Start KMC session | "Press to start Kangaroo Care session" |
| `end-kmc` | End KMC session | "Press to end your session" |
| `pause-kmc` | Pause session | "Press to pause" |
| `position-chest` | Chest-to-chest position | "Baby on chest, skin to skin" |
| `position-wrap` | Upright wrap position | "Baby wrapped upright on chest" |

### Logging
| Key | Description | Suggested Script |
|-----|-------------|------------------|
| `log-feeding` | Log feeding | "Record baby's feeding" |
| `log-weight` | Log weight | "Record baby's weight" |
| `log-daily` | Daily log | "Record daily observations" |
| `feeding-breast` | Breastfeeding | "Direct breastfeeding" |
| `feeding-expressed` | Expressed milk | "Expressed breast milk" |
| `feeding-formula` | Formula | "Formula milk" |

### Baby Setup
| Key | Description | Suggested Script |
|-----|-------------|------------------|
| `enter-baby-name` | Baby name field | "Enter your baby's name" |
| `enter-birth-date` | Birth date | "When was baby born?" |
| `enter-weight` | Weight field | "Enter baby's weight in grams" |
| `select-nurse` | Nurse selection | "Choose your nurse" |
| `select-facility` | Facility selection | "Select your hospital" |

### Nurse Approval
| Key | Description | Suggested Script |
|-----|-------------|------------------|
| `nurse-accepted` | Approval notification | "Your nurse has accepted" |
| `nurse-declined` | Decline notification | "Please choose another nurse" |
| `pending-approval` | Waiting status | "Waiting for nurse approval" |

### Education Categories
| Key | Description |
|-----|-------------|
| `edu-kmc-basics` | KMC Basics category |
| `edu-breastfeeding` | Breastfeeding category |
| `edu-hygiene` | Hygiene category |
| `edu-support` | Support category |
| `edu-safety` | Safety category |
| `edu-dads` | Dad's Corner category |

## Audio File Requirements

- **Format**: MP3 (for broad compatibility)
- **Quality**: 128kbps minimum
- **Duration**: 2-5 seconds per clip
- **Tone**: Warm, clear, reassuring female voice
- **Pace**: Slow and clear for comprehension

## Implementation Notes

The `AudioButton` component automatically:
1. Checks user's selected language
2. Hides for English users
3. Plays the appropriate audio file when clicked
4. Fails silently if file is not found

To add audio support to any UI element:
\`\`\`tsx
import { AudioButton } from '@/components/ui/audio-button'

// Next to a button or label
<div className="flex items-center gap-2">
  <Label>Start KMC</Label>
  <AudioButton audioKey="start-kmc" />
</div>
\`\`\`

## Testing

1. Set your account language to Twi (tw) in Profile settings
2. Audio icons should appear next to supported UI elements
3. Click icons to test playback
4. Check browser console for "Audio file not found" messages for missing files
