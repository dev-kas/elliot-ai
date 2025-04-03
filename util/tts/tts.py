import torch
from TTS.api import TTS

device = "cpu"

# if torch.backends.mps.is_available():
#     device = "mps"
# elif torch.cuda.is_available():
#     device = "cuda"

def main(args):
    if len(args) < 3:
        print("Error: Missing required arguments. Expected text, lang, and output file. (Order is important)")
        sys.exit(1)
    
    text, model, speaker, output = args

    try:
        tts = TTS(model_name=model).to(device)
        tts.tts_to_file(text=text, file_path=output, speaker=speaker)
    except Exception as e:
        print(f"Error generating speech: {e}")
        sys.exit(1)

if __name__ == "__main__":
    import sys
    main(sys.argv[1:])
