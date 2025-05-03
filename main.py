from flask import Flask, jsonify, request
from TTS.api import TTS
from scipy.signal import butter, lfilter
import numpy as np
from scipy.io.wavfile import write

app = Flask(__name__)

device = "cpu"

# if torch.backends.mps.is_available():
#     device = "mps"
# elif torch.cuda.is_available():
#     device = "cuda"


@app.route('/')
def index():
    return jsonify({"status": "ok"}), 200

@app.route('/tts', methods=['POST'])
def tts():
    data = request.get_json()
    text = data.get('text')
    model = data.get('model')
    speaker = data.get('speaker')
    output = data.get('output')

    try:
        tts = TTS(model_name=model).to(device)
        wav = tts.tts(text=text, speaker=speaker)
        wav = butter_lowpass_filter(wav, cutoff=8000, fs=tts.synthesizer.output_sample_rate)
        wav = np.clip(wav, -1.0, 1.0)
        wav = wav / np.max(np.abs(wav))
        write(output, tts.synthesizer.output_sample_rate, (wav * 32767).astype(np.int16))
        return jsonify({"status": "success", "output": output}), 200
    except Exception as e:
        print(f"Error generating speech: {e}")
        return jsonify({"status": "error", "output": str(e)}), 500

def butter_lowpass_filter(data, cutoff, fs, order=5):
    nyquist = 0.5 * fs
    normal_cutoff = cutoff / nyquist
    b, a = butter(order, normal_cutoff, btype='low', analog=False)
    y = lfilter(b, a, data)
    return y

if __name__ == "__main__":
    app.run(port=5500)
