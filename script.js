function convert_to_jw(values) {
    var K = 1;
    const converted = [];

    for(var value of values) {
        const [s_coefficient, constant] = value;
        if(s_coefficient === 0) {
            K *= constant;
            continue;
        }

        const jw_coefficient = 1;
        const new_constant = constant / s_coefficient;
        K *= s_coefficient;
        converted.push([new_constant, jw_coefficient]);
    }

    return [[K, 0], ...converted];
}

function print_jw(values) {
    var equation = '';
    for(var value of values) {
        const [real, imaginary] = value;
        if(Math.sign(imaginary)  === 1) {
            equation += `(${real} + j${Math.abs(imaginary)}w)`;
        }
        else if(Math.sign(imaginary) === -1){
            equation += `(${real} - j${Math.abs(imaginary)}w)`;
        }
        else {
            equation += `(${real})`;
        }
    }

    console.log(equation);
}

function print_w_power(values) {
    const [reals, imaginaries] = values;
    var real_equation = '';
    var imaginary_equation = '';

    for(var i = 0; i < reals.length; i++) {
        real_equation += `w^${2 * i}(${reals[i].toFixed(2)}) + `
    }

    for(var i = 0; i < imaginaries.length; i++) {
        imaginary_equation += `w^${2 * i + 1}(${imaginaries[i].toFixed(2)}) + `
    }
    console.log(`${real_equation} j(${imaginary_equation.slice(0, -3)})`);
}

function get_conjugates(values, constants=true) {
    const converted = [];

    for(var value of values) {
        const [real, imaginary] = value;
        if(constants === false && imaginary === 0) {
            continue;
        }
        converted.push([real, -1 * imaginary]);
    }

    return converted;
}

function convert_one_jw(values) {
    const converted = [];
    var K = 1;

    for(var value of values) {
        const [real, imaginary] = value;
        if(imaginary === 0) {
            K *= real;
        }
        else if(imaginary !== 1) {
            converted.push([real / imaginary, 1]);
            K *= imaginary;
        }
        else {
            converted.push([real, imaginary]);
        }
    }
    
    return [K, converted];
}

function multiply_constant(values, K) {
    const converted = [[], []];
    const [reals, imaginaries] = values;
    for(var real of reals) {
        converted[0].push(real * K);
    }
    
    for(var imaginary of imaginaries) {
        converted[1].push(imaginary * K);
    }

    return converted;
}

function get_all_products(values, m) {
    var total = 0;
    const stack = [{ combo: [], start: 0 }];
  
    while(stack.length > 0) {
        const { combo, start } = stack.pop();
  
        if(combo.length === m) {
            total += combo.reduce((a, b) => a * b, 1);
            continue;
        }
  
        for(let i = values.length - 1; i >= start; i--) {
            stack.push({ combo: [...combo, values[i]], start: i + 1 });
        }
    }
    return total;
}

function multiply_complex_with_w(values) {
    const n = values.length;
    const reals = values.map(v => v[0]);
    const result = [[], []];

    for(var i = 0; i <= n; i++) {
        const sign = i % 4 <= 1 ? 1 : -1;
        const type = i % 2 == 0 ? 0 : 1; // real: 0, imaginary: 1
        const product = sign * get_all_products(reals, (n - i));
        result[type].push(product);
    }
    return result;
}

function calculate_complex_with_w(values, w) {
    const [reals, imaginaries] = values;
    var real = 0, imaginary = 0;

    for(var i = 0; i < reals.length; i++) {
        real += reals[i] * Math.pow(w, 2 * i);
    }

    for(var i = 0; i < imaginaries.length; i++) {
        imaginary += imaginaries[i] * Math.pow(w, 2 * i + 1);
    }

    return [real, imaginary];
}

function parse_input(input) {
    const matches = [...input.matchAll(/\(([^)]*)\)/g)];
    const parsed = [];

    matches.forEach(match => {
        const value = match[1].replace(/\s+/g, '');

        const form1 = /^[+-]?\d+(\.\d+)?$/;
        const form2 = /^[+-]?(\d+(\.\d+)?)*s$/;
        const form3 = /^[+-]?(\d+(\.\d+)?)*s[+-]\d+(\.\d+)?$/;

        var s_coefficient;
        var constant;

        if(form1.test(value)) {
            s_coefficient = 0;
            constant = parseFloat(value);
        }
        else if(form2.test(value)) {
            s_coefficient = value.replace('s', '');
            s_coefficient = s_coefficient === '' || s_coefficient === '+' ? 1 : s_coefficient === '-' ? -1 : parseFloat(s_coefficient);
            constant = 0;
        }
        else if(form3.test(value)) {
            const [s_part, const_part] = value.split(/(?=[+-]\d)/);
            s_coefficient = s_part.replace('s', '');
            s_coefficient = s_coefficient === '' || s_coefficient === '+' ? 1 : s_coefficient === '-' ? -1 : parseFloat(s_coefficient);
            constant = parseFloat(const_part);
        }
        else {
            console.error('Unknown input format');
        }

        parsed.push([s_coefficient, constant]);
    });

    return parsed;
}

function convert_latex(numerator, denominator) {
    const [real_numerator, imaginary_numerator] = numerator;
    const [real_denominator] = denominator;

    var real = '';
    var imaginary = '';

    real += '\\frac{';
    imaginary += '\\frac{'

    for(var i = 0; i < real_numerator.length; i++) {
        real += `${real_numerator[i]}t^{${2 * i}}+`
    }
    real = real.slice(0, -1) + '}{';

    for(var i = 0; i < imaginary_numerator.length; i++) {
        imaginary += `${imaginary_numerator[i]}t^{${2 * i + 1}}+`
    }
    imaginary = imaginary.slice(0, -1) + '}{';

    for(var i = 0; i < real_denominator.length; i++) {
        real += `${real_denominator[i]}t^{${2 * i}}+`
        imaginary += `${real_denominator[i]}t^{${2 * i}}+`
    }
    real = real.slice(0, -1) + '}';
    imaginary = imaginary.slice(0, -1) + '}';

    return `(${real}, ${imaginary})`;
}

function find_bounds(numerator, denominator, bounds) {
    const [min_bound, max_bound] = bounds;
    var left = Infinity, right = -Infinity, bottom = Infinity, top = -Infinity;

    for(var w = min_bound; w <= max_bound; w++) {
        const numerator_value = calculate_complex_with_w(numerator, w);
        const denominator_value = calculate_complex_with_w(denominator, w);
        const real = numerator_value[0] / denominator_value[0];
        const imaginary = numerator_value[1] / denominator_value[0];

        left = Math.min(left, real);
        right = Math.max(right, real);
        bottom = Math.min(bottom, imaginary);
        top = Math.max(top, imaginary);
    }

    var top_bottom = top - bottom;
    var right_left = right - left;
    var vertical_margin = 0;
    var horizontal_margin = 0;

    if(top_bottom * 2 >= right_left) {
        right_left = top_bottom * 2;
    }
    else {
        top_bottom = right_left / 2;
    }

    vertical_margin = top_bottom * 0.1;
    horizontal_margin = right_left * 0.1;


    left = (right + left) / 2 - right_left / 2;
    right = (right + left) / 2 + right_left / 2;
    bottom = (top + bottom) / 2 - top_bottom / 2;
    top = (top + bottom) / 2 + top_bottom / 2;

    return [left - horizontal_margin, right + horizontal_margin, bottom - vertical_margin, top + vertical_margin];
}

function draw_nyquist(calculator) {
    const numerator = document.getElementById('numerator').value;
    const denominator = document.getElementById('denominator').value;

    const numerator_parsed = parse_input(numerator);
    const denominator_parsed = parse_input(denominator);
    
    const numerator_jw = convert_to_jw(numerator_parsed);
    const denominator_jw = convert_to_jw(denominator_parsed);
    const mul_denominator_jw = get_conjugates(denominator_jw, constants=false);
    
    numerator_jw.push(...mul_denominator_jw);
    denominator_jw.push(...mul_denominator_jw);
    
    const [K_numerator, numerator_jw_without_constant] = convert_one_jw(numerator_jw);
    const [K_denominator, denominator_jw_without_constant] = convert_one_jw(denominator_jw);
    const total_K = K_numerator / K_denominator;
    
    const numerator_jw_multiplied = multiply_complex_with_w(numerator_jw_without_constant);
    const denominator_jw_multiplied = multiply_complex_with_w(denominator_jw_without_constant);
    
    for(var coefficients of denominator_jw_multiplied[1]) {
        if(coefficients.toFixed(2) !== '0.00') {
            console.error('Incorrect Denominator');
            return;
        }
    }
    
    const numerator_jw_multiplied_with_constant = multiply_constant(numerator_jw_multiplied, total_K);
    const denominator_jw_multiplied_only_real = [denominator_jw_multiplied[0], []];
    const equation = convert_latex(numerator_jw_multiplied_with_constant, denominator_jw_multiplied_only_real);

    const bounds = [-1000, 1000];
    const [left, right, bottom, top] = find_bounds(numerator_jw_multiplied_with_constant, denominator_jw_multiplied_only_real, bounds);


    calculator.setMathBounds({
        left: left,
        right: right,
        bottom: bottom,
        top: top
    });

    calculator.setExpression({
        id: 'nyquist',
        latex: equation,
        lineStyle: Desmos.Styles.SOLID,
        lineOpacity: 1.0,
        color: Desmos.Colors.BLACK,
        parametricDomain: { min: bounds[0], max: bounds[1] }
    });
}

const calculator = Desmos.GraphingCalculator(document.getElementById('calculator'), {
    expressionsCollapsed: true,
    expressions: false,
    settingsMenu: false,
    zoomButtons: false
});

document.addEventListener('keydown', function(event) {
    if(event.key === 'Enter') {
        draw_nyquist(calculator);
    }
});
