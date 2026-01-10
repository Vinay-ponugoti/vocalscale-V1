"""
Production-Ready Voice Quality Validator
Validates and analyzes voice recordings for quality metrics
"""
import logging
import wave
import struct
import hashlib
import time
from typing import Dict, Any
from io import BytesIO

logger = logging.getLogger(__name__)


class VoiceQualityValidator:
    """Service for validating voice recording quality"""
    
    def __init__(self):
        # Quality thresholds
        self.min_duration = 3.0  # Minimum 3 seconds
        self.max_duration = 60.0  # Maximum 60 seconds
        self.min_sample_rate = 16000  # Minimum 16kHz
        self.max_silence_percentage = 50.0  # Maximum silence
        
        # Supported formats
        self.supported_formats = {
            "audio/wav": self._analyze_wav,
            "audio/mpeg": self._analyze_mp3,
            "audio/mp3": self._analyze_mp3,
            "audio/webm": self._analyze_webm,
            "video/webm": self._analyze_webm,
            "audio/mp4": self._analyze_mp4,
            "audio/x-m4a": self._analyze_mp4,
            "audio/m4a": self._analyze_mp4,
            "video/mp4": self._analyze_mp4
        }
        
    async def validate_audio_file(
        self, 
        file_data: bytes, 
        content_type: str
    ) -> Dict[str, Any]:
        """
        Comprehensive audio validation and quality analysis
        
        Args:
            file_data: Raw audio file bytes
            content_type: MIME type of audio file
            
        Returns:
            Dictionary with validation results and quality metrics
        """
        try:
            logger.info(
                f"🎙️ Validating audio: {len(file_data)} bytes, "
                f"type: {content_type}"
            )
            
            # Basic validation
            if not file_data:
                return self._error_response("Empty file")
            
            if len(file_data) < 1024:
                return self._error_response("File too small (< 1KB)")
            
            # Parse based on format
            analyzer = self.supported_formats.get(content_type)
            if not analyzer:
                return self._error_response(
                    f"Unsupported format: {content_type}"
                )
            
            audio_info = await analyzer(file_data)
            
            if not audio_info["valid"]:
                return audio_info
            
            # Calculate quality metrics
            quality_score = await self._calculate_quality_score(audio_info)
            audio_info["quality_score"] = quality_score
            audio_info["recommendations"] = await self._get_quality_recommendations(audio_info)
            
            # Add metadata
            audio_info = await self.enhance_audio_metadata(file_data, audio_info)
            
            logger.info(
                f"✅ Validation complete. Quality: {quality_score}/100"
            )
            return audio_info
            
        except Exception as e:
            logger.error(f"❌ Validation error: {str(e)}")
            return self._error_response(f"Validation failed: {str(e)}")
    
    def _error_response(self, error: str) -> Dict[str, Any]:
        """Create standardized error response"""
        return {"valid": False, "error": error}
    
    async def _analyze_wav(self, file_data: bytes) -> Dict[str, Any]:
        """Analyze WAV format with comprehensive checks"""
        try:
            with wave.open(BytesIO(file_data), 'rb') as wav_file:
                params = wav_file.getparams()
                
                # Extract parameters
                channels = params.nchannels
                sample_width = params.sampwidth
                sample_rate = params.framerate
                n_frames = params.nframes
                duration = n_frames / sample_rate
                
                # Duration validation
                if duration < self.min_duration:
                    return self._error_response(
                        f"Too short: {duration:.1f}s (min {self.min_duration}s)"
                    )
                
                if duration > self.max_duration:
                    return self._error_response(
                        f"Too long: {duration:.1f}s (max {self.max_duration}s)"
                    )
                
                # Sample rate validation
                if sample_rate < self.min_sample_rate:
                    return self._error_response(
                        f"Sample rate too low: {sample_rate}Hz (min {self.min_sample_rate}Hz)"
                    )
                
                # Analyze audio levels
                sample_frames = min(4410, n_frames)  # Up to 0.1s
                sample_data = wav_file.readframes(sample_frames)
                
                avg_level = self._calculate_audio_level(
                    sample_data, 
                    sample_width
                )
                
                # Check for silence
                if avg_level < 0.01:
                    return self._error_response(
                        "Audio appears to be silent or extremely quiet"
                    )
                
                return {
                    "valid": True,
                    "format": "wav",
                    "duration": duration,
                    "sample_rate": sample_rate,
                    "channels": channels,
                    "sample_width": sample_width,
                    "bit_depth": sample_width * 8,
                    "avg_level": avg_level,
                    "file_size": len(file_data),
                    "compression": "none",
                    "lossless": True
                }
                
        except wave.Error as e:
            return self._error_response(f"WAV parsing error: {str(e)}")
        except Exception as e:
            return self._error_response(f"WAV analysis failed: {str(e)}")
    
    def _calculate_audio_level(
        self, 
        sample_data: bytes, 
        sample_width: int
    ) -> float:
        """Calculate average audio level from sample"""
        try:
            if sample_width == 1:
                # 8-bit audio (unsigned)
                levels = struct.unpack(f'{len(sample_data)}B', sample_data)
                avg = sum(abs(level - 128) for level in levels) / len(levels)
                return avg / 128.0
            elif sample_width == 2:
                # 16-bit audio (signed)
                levels = struct.unpack(f'{len(sample_data)//2}h', sample_data)
                avg = sum(abs(level) for level in levels) / len(levels)
                return avg / 32768.0
            elif sample_width == 3:
                # 24-bit audio (less common)
                return 0.5  # Default estimate
            elif sample_width == 4:
                # 32-bit audio
                levels = struct.unpack(f'{len(sample_data)//4}i', sample_data)
                avg = sum(abs(level) for level in levels) / len(levels)
                return avg / 2147483648.0
            else:
                return 0.5  # Default for unknown
        except Exception as e:
            logger.warning(f"Level calculation error: {e}")
            return 0.5
    
    async def _analyze_mp3(self, file_data: bytes) -> Dict[str, Any]:
        """Analyze MP3 format (basic validation)"""
        if len(file_data) < 1024:
            return self._error_response("File too small for MP3")
        
        # Check for MP3 header signatures
        has_id3 = file_data[:3] == b'ID3'
        has_sync = file_data[:2] == b'\xff\xfb' or file_data[:2] == b'\xff\xfa'
        
        if not (has_id3 or has_sync):
            return self._error_response("Invalid MP3 header")
        
        # Rough duration estimate (128 kbps average)
        estimated_duration = len(file_data) / 16000
        
        if estimated_duration < self.min_duration:
            return self._error_response(
                f"Estimated duration too short: {estimated_duration:.1f}s"
            )
        
        return {
            "valid": True,
            "format": "mp3",
            "estimated_duration": estimated_duration,
            "file_size": len(file_data),
            "compression": "lossy",
            "lossless": False,
            "note": "Detailed MP3 analysis requires additional libraries (pydub, mutagen)"
        }
    
    async def _analyze_webm(self, file_data: bytes) -> Dict[str, Any]:
        """Analyze WebM format (basic validation)"""
        if len(file_data) < 1024:
            return self._error_response("File too small for WebM")
        
        # Check WebM/Matroska signature (EBML)
        if file_data[:4] != b'\x1a\x45\xdf\xa3':
            return self._error_response("Invalid WebM signature")
        
        # Rough estimate (assuming Opus codec at ~64 kbps)
        estimated_duration = len(file_data) / 8000
        
        if estimated_duration < self.min_duration:
            return self._error_response(
                f"Estimated duration too short: {estimated_duration:.1f}s"
            )
        
        return {
            "valid": True,
            "format": "webm",
            "estimated_duration": estimated_duration,
            "file_size": len(file_data),
            "compression": "lossy",
            "lossless": False,
            "note": "Detailed WebM analysis requires additional libraries (python-ebml)"
        }

    async def _analyze_mp4(self, file_data: bytes) -> Dict[str, Any]:
        """Analyze MP4/M4A format (basic validation)"""
        if len(file_data) < 1024:
            return self._error_response("File too small for MP4/M4A")
        
        # Check for ftyp atom (MP4 container signature)
        if b'ftyp' not in file_data[:20]:
            return self._error_response("Invalid MP4/M4A signature")
        
        # Check for common MP4/M4A brands
        valid_brands = [b'M4A ', b'mp42', b'isom', b'iso2']
        has_valid_brand = any(brand in file_data[:32] for brand in valid_brands)
        
        if not has_valid_brand:
            logger.warning("MP4/M4A brand not recognized, proceeding with caution")
        
        # Rough estimate (assuming AAC at ~128 kbps)
        estimated_duration = len(file_data) / 16000
        
        if estimated_duration < self.min_duration:
            return self._error_response(
                f"Estimated duration too short: {estimated_duration:.1f}s"
            )
        
        return {
            "valid": True,
            "format": "mp4/m4a",
            "estimated_duration": estimated_duration,
            "file_size": len(file_data),
            "compression": "lossy",
            "lossless": False,
            "note": "Detailed MP4 analysis requires additional libraries (mutagen, pymediainfo)"
        }
    
    async def _calculate_quality_score(self, audio_info: Dict[str, Any]) -> float:
        """Calculate quality score (0-100) based on audio metrics"""
        score = 100.0
        
        # Duration scoring
        duration = audio_info.get("duration", audio_info.get("estimated_duration", 0))
        if duration < self.min_duration:
            score -= 30
        elif duration > self.max_duration:
            score -= 10
        elif duration < 5.0:
            score -= 10  # A bit short
        elif 5.0 <= duration <= 15.0:
            score += 5  # Optimal range
        
        # Sample rate scoring
        sample_rate = audio_info.get("sample_rate", 0)
        if sample_rate > 0:
            if sample_rate < self.min_sample_rate:
                score -= 20
            elif sample_rate < 22050:
                score -= 10
            elif sample_rate >= 44100:
                score += 5  # High quality bonus
        
        # Audio level scoring
        avg_level = audio_info.get("avg_level", 0.5)
        if avg_level < 0.05:  # Very quiet
            score -= 25
        elif avg_level > 0.9:  # Likely clipping
            score -= 15
        elif avg_level < 0.2:  # Too quiet
            score -= 10
        elif 0.3 <= avg_level <= 0.7:  # Good range
            score += 5
        
        # Format scoring
        format_type = audio_info.get("format", "")
        if format_type == "wav":
            score += 5  # Lossless bonus
        elif format_type in ["mp3", "webm", "mp4/m4a"]:
            score -= 5  # Lossy penalty
        
        # Bit depth scoring (if available)
        bit_depth = audio_info.get("bit_depth", 0)
        if bit_depth >= 24:
            score += 3
        elif bit_depth == 16:
            score += 1
        
        # Channel scoring
        channels = audio_info.get("channels", 1)
        if channels == 1:
            score += 2  # Mono is fine for voice
        elif channels == 2:
            score += 0  # Stereo is okay
        else:
            score -= 5  # More than stereo is unusual
        
        return max(0, min(100, score))
    
    async def _get_quality_recommendations(
        self, 
        audio_info: Dict[str, Any]
    ) -> list:
        """Generate recommendations for improving quality"""
        recommendations = []
        
        # Duration recommendations
        duration = audio_info.get("duration", audio_info.get("estimated_duration", 0))
        if duration < self.min_duration:
            recommendations.append(
                "⏱️ Recording too short. Aim for at least 3 seconds of clear speech."
            )
        elif duration < 5.0:
            recommendations.append(
                "⏱️ Recording a bit short. Try 5-10 seconds for better voice cloning."
            )
        elif duration > self.max_duration:
            recommendations.append(
                "⏱️ Recording quite long. Keep it under 60 seconds for best results."
            )
        elif 5.0 <= duration <= 15.0:
            recommendations.append(
                "✅ Duration is perfect for voice cloning!"
            )
        
        # Sample rate recommendations
        sample_rate = audio_info.get("sample_rate", 0)
        if sample_rate > 0:
            if sample_rate < self.min_sample_rate:
                recommendations.append(
                    f"📉 Low sample rate ({sample_rate}Hz). Use higher quality recording (min {self.min_sample_rate}Hz)."
                )
            elif sample_rate >= 44100:
                recommendations.append(
                    "✅ Excellent sample rate for high quality voice cloning!"
                )
        
        # Audio level recommendations
        avg_level = audio_info.get("avg_level", 0.5)
        if avg_level < 0.05:
            recommendations.append(
                "🔇 Recording very quiet. Speak louder or increase microphone gain."
            )
        elif avg_level > 0.9:
            recommendations.append(
                "🔊 Audio may be too loud or clipping. Reduce input volume or move away from mic."
            )
        elif avg_level < 0.2:
            recommendations.append(
                "🔉 Recording a bit quiet. Speak more clearly or increase mic sensitivity."
            )
        elif 0.3 <= avg_level <= 0.7:
            recommendations.append(
                "✅ Audio level is perfect!"
            )
        
        # Format recommendations
        format_type = audio_info.get("format", "")
        if format_type in ["mp3", "webm", "mp4/m4a"]:
            recommendations.append(
                "📦 Consider using WAV format for best voice cloning quality (lossless)."
            )
        elif format_type == "wav":
            recommendations.append(
                "✅ WAV format is ideal for voice cloning!"
            )
        
        # Channel recommendations
        channels = audio_info.get("channels", 1)
        if channels > 2:
            recommendations.append(
                "🎙️ Multi-channel audio detected. Mono or stereo is recommended for voice."
            )
        
        # General recommendations
        if not recommendations or len([r for r in recommendations if '✅' in r]) >= 3:
            recommendations.append(
                "🎯 Overall excellent quality! Ensure clear, consistent speech for best results."
            )
        
        return recommendations
    
    async def enhance_audio_metadata(
        self, 
        file_data: bytes, 
        audio_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Add enhanced metadata to audio information"""
        enhanced_info = audio_info.copy()
        
        # Add file integrity hash
        file_hash = hashlib.sha256(file_data).hexdigest()
        enhanced_info["file_hash"] = file_hash
        enhanced_info["file_hash_algorithm"] = "sha256"
        
        # Add validation timestamp
        enhanced_info["validation_timestamp"] = time.time()
        enhanced_info["validation_timestamp_iso"] = time.strftime(
            "%Y-%m-%dT%H:%M:%SZ", 
            time.gmtime()
        )
        
        # Add compression info
        if audio_info.get("format") == "wav":
            enhanced_info["compression"] = "none"
            enhanced_info["lossless"] = True
        elif audio_info.get("format") in ["mp3", "webm", "mp4/m4a"]:
            enhanced_info["compression"] = "lossy"
            enhanced_info["lossless"] = False
        
        # Calculate estimated bitrate (if available)
        duration = audio_info.get("duration", audio_info.get("estimated_duration", 0))
        file_size = audio_info.get("file_size", 0)
        if duration > 0 and file_size > 0:
            bitrate_bps = (file_size * 8) / duration
            enhanced_info["estimated_bitrate_kbps"] = round(bitrate_bps / 1000, 2)
        
        # Add suitability score for voice cloning
        quality_score = enhanced_info.get("quality_score", 0)
        if quality_score >= 80:
            enhanced_info["voice_cloning_suitability"] = "excellent"
        elif quality_score >= 60:
            enhanced_info["voice_cloning_suitability"] = "good"
        elif quality_score >= 40:
            enhanced_info["voice_cloning_suitability"] = "acceptable"
        else:
            enhanced_info["voice_cloning_suitability"] = "poor"
        
        return enhanced_info
    
    def get_format_support_info(self) -> Dict[str, Any]:
        """Return information about supported formats"""
        return {
            "supported_formats": list(self.supported_formats.keys()),
            "recommended_format": "audio/wav",
            "min_duration": self.min_duration,
            "max_duration": self.max_duration,
            "min_sample_rate": self.min_sample_rate,
            "recommended_sample_rate": 44100,
            "recommended_bit_depth": 16,
            "recommended_channels": 1
        }