import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from clinical_ai_evidence_registry import build_pack  # noqa: E402


class PackTest(unittest.TestCase):
    def test_pack_prioritizes_sepsis_model(self):
        pack = build_pack("fixtures/clinical-ai-evidence.json")
        self.assertEqual(pack["findings"][0]["name"], "Sepsis early-warning model")
        self.assertEqual(pack["modelsOnHold"], 2)
        self.assertIn("Sepsis early-warning model", pack["primaryRecommendation"])


if __name__ == "__main__":
    unittest.main()
