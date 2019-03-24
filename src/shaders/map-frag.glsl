#version 300 es
precision highp float;

uniform float u_ShowPopulation;
uniform float u_ShowTerrainGradient;
uniform float u_ShowTerrainBinary;

in vec4 fs_Col;
in vec4 fs_Pos;

out vec4 out_Col;

/*
 * Noise functions
 */

float random(vec2 ab) {
    float f = (cos(dot(ab ,vec2(21.9898,78.233))) * 43758.5453);
	return fract(f);
}

vec2 random2( vec2 p , vec2 seed) {
  return fract(sin(vec2(dot(p + seed, vec2(311.7, 127.1)), dot(p + seed, vec2(269.5, 183.3)))) * 85734.3545);
}

float randv(vec2 n) {
  float v = (fract(cos(dot(n, vec2(12.9898, 4.1414))) * 43758.5453));
  return v;
}

float interpNoise2D(vec2 p) {
    float intX = floor(p.x);
    float intY = floor(p.y);
    float fractX = fract(p.x);
    float fractY = fract(p.y);

    float v1 = randv(vec2(intX,intY));
    float v2 = randv(vec2(intX + 1.0,intY));
    float v3 = randv(vec2(intX,intY + 1.0));
    float v4 = randv(vec2(intX + 1.0,intY + 1.0));

    float i1 = mix(v1, v2, fractX);
    float i2 = mix(v3, v4, fractX);

    return mix(i1, i2, fractY);
}

float random1( vec2 p , vec2 seed) {
  return fract(sin(dot(p + seed, vec2(127.1, 311.7))) * 43758.5453);
}

float rand(vec2 c){
	return fract(sin(dot(c.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float noise(vec2 p, float freq ){
	float unit = 1.5/freq;
	vec2 ij = floor(p/unit);
	vec2 xy = mod(p,unit)/unit;
	xy = .5*(1.-cos(3.14*xy));
	float a = rand((ij+vec2(0.,0.)));
	float b = rand((ij+vec2(1.,0.)));
	float c = rand((ij+vec2(0.,1.)));
	float d = rand((ij+vec2(1.,1.)));
	float x1 = mix(a, b, xy.x);
	float x2 = mix(c, d, xy.x);
	return mix(x1, x2, xy.y);
}

float pNoise(vec2 p, int res){
	float persistance = .5;
	float n = 0.;
	float normK = 0.;
	float f = 4.;
	float amp = 1.;
	int iCount = 0;
	for (int i = 0; i<20; i++){
		n+=amp*noise(p, f);
		f*=2.;
		normK+=amp;
		amp*=persistance;
		if (iCount == res) break;
		iCount++;
	}
	float nf = n/normK;
	return nf*nf*nf*nf;
}

// Normal fbm
float fbm(vec2 p, float persistence, float octaves) {
    p /= 10.0f; // higher divisor = less variability of land; lower = really random/jumpy
    float total = 0.0;

    float counter = 0.0;
    for (float i = 0.0; i < octaves; i = i+1.0) {
        float freq = pow(2.0, counter);
        float amp = pow(persistence, counter);
        total += interpNoise2D(vec2(p.x * freq, p.y * freq)) * amp;
        counter++;
    }
    return total;
}

float noise(in vec2 xy) {
	vec2 ij = floor(xy);
	vec2 uv = xy-ij;
	uv = uv*uv*(3.0-2.0*uv);

	float a = random(vec2(ij.x, ij.y ));
	float b = random(vec2(ij.x+1., ij.y));
	float c = random(vec2(ij.x, ij.y+1.));
	float d = random(vec2(ij.x+1., ij.y+1.));
	float k0 = a;
	float k1 = b-a;
	float k2 = c-a;
	float k3 = a-b-c+d;
	return (k0 + k1*uv.x + k2*uv.y + k3*uv.x*uv.y);
}


float worley(float x, float y, float rows, float cols) {
    float xPos = x * float(rows) / 20.0;
    float yPos = y * float(cols) / 20.0;

    float minDist = 60.0;
    vec2 minVec = vec2(0.0, 0.0);

    // Find closest point
    for (int i = -1; i < 2; i++) {
        for (int j = -1; j < 2; j++) {
            vec2 currGrid = vec2(floor(float(xPos)) + float(i), floor(float(yPos)) + float(j));
            vec2 currNoise = currGrid + random2(currGrid, vec2(2.0, 1.0));
            float currDist = distance(vec2(xPos, yPos), currNoise);
            if (currDist <= minDist) {
                minDist = currDist;
                minVec = currNoise;
            }
        }
    }
    return minDist;
}

float generateColor(float x, float y) {
  // noise 3.1 - color, using perlin noise as an input to fbm
  float total = 0.0;
  float persistence = 0.5f;
  float octaves = 5.0;

  for (float i = 0.0; i < octaves; i = i + 1.0) {
    float freq = pow(2.0f, i);
    float amp = pow(persistence, i);
    total += (1.0 / freq) * pNoise(vec2(x * freq, y * freq), 1);
  }
  return total;
}

/*
* Main
*/
void main()
{
    //vec3 landCol = vec3(0.2, 0.6, 0.1);
    vec3 landCol = vec3(128.f, 200.f, 101.f) / 255.0;
    vec3 waterCol = vec3(0.0, 0.0, 0.5);
    vec3 populationCol = vec3(155.f, 106.f, 196.f) / 255.0;

    float height = generateColor(fs_Pos.x, fs_Pos.y) * 3.0;
    float population = max(0.0, generateColor(fs_Pos.x, fs_Pos.y) * 2.0);
    population = min(1.0, population);

    if (height < 0.35) {
      population = 0.0;
    }

    vec3 terrainCol;
    vec3 finalCol;

    // Calculate terrain color
    if (height < 0.35) {
        // Water
        terrainCol = waterCol;
    } else {
        // Land
        if (u_ShowTerrainBinary == 1.0) {
            height = 1.0;
        }
        terrainCol = landCol * height;
    }

    // Calculate population color
    populationCol = populationCol * population;

    // Case on which combination of terrain/population to display
    if (u_ShowPopulation == 1.0 && (u_ShowTerrainBinary == 1.0 || u_ShowTerrainGradient == 1.0)) {
        finalCol = mix(terrainCol, populationCol, 0.5);
    } else if (u_ShowPopulation == 1.0) {
        finalCol = populationCol;
    } else if (u_ShowTerrainBinary == 1.0 || u_ShowTerrainGradient == 1.0) {
        finalCol = terrainCol;
    } else {
        finalCol = vec3(0.0, 0.0, 0.0);
    }

    out_Col = vec4(finalCol, 1.0);
}

// If both: overlay both with 0.5 opacity each
